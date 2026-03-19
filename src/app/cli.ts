#!/usr/bin/env node
import fs from 'node:fs';
import chalk from 'chalk';
import { createCLI, fatalError, formatError, getExitCode, runIfMain } from '@yaos-git/toolkit/cli';
import { aesDecrypt, aesEncrypt } from '../crypto/aes/index.js';
import { generateMasterKey } from '../crypto/masterKey/index.js';
import { createSlot, unwrapSlot } from '../crypto/slot/index.js';
import type { Lockbox } from '../types/Lockbox/index.js';
import { loadEnvelope, saveEnvelope } from '../utils/envelope/index.js';
import { parseEnv } from '../utils/envParser/index.js';
import { executeWithSecrets } from '../utils/executor/index.js';
import { loadLockbox, saveLockbox } from '../utils/lockbox/index.js';
import { promptPassword } from '../utils/prompt/index.js';

declare const __CLI_VERSION__: string;

async function getPassword(): Promise<string | null> {
	const envPassword = process.env.ENV_LOCK_PASSWORD;
	if (envPassword) return envPassword;

	try {
		return await promptPassword('Password: ');
	} catch {
		return null;
	}
}

export async function runCLI(
	args: string[] = process.argv.slice(2),
): Promise<void> {
	const { program } = createCLI({
		name: 'env-lock',
		description: 'Encrypted environment injection with multi-lock team access',
		version: __CLI_VERSION__,
	});

	program.configureOutput({
		writeOut: (str) => {
			console.log(str);
		},
		writeErr: (str) => {
			console.error(str);
		},
	});

	program
		.command('init')
		.description('Initialize a new lockbox with the first user slot')
		.argument('<slot-id>', 'Slot identifier (e.g. your email)')
		.action(async (slotId: string) => {
			const existing = loadLockbox();
			if (existing) {
				fatalError('env-lock.json already exists. Aborting.');
				return;
			}

			const password = await getPassword();
			if (!password) {
				fatalError('No password provided.');
				return;
			}

			const mk = generateMasterKey();
			const slot = createSlot(mk, password, slotId);
			const lockbox: Lockbox = { version: 1, slots: [slot] };

			saveLockbox(lockbox);
			console.log(chalk.green(`Lockbox initialized with slot "${slotId}".`));
		});

	program
		.command('seal')
		.description('Encrypt a .env file into .env.enc')
		.argument('<file>', 'Path to plain-text .env file')
		.action(async (file: string) => {
			const lockbox = loadLockbox();
			if (!lockbox) {
				fatalError('No env-lock.json found. Run "env-lock init" first.');
				return;
			}

			const password = await getPassword();
			if (!password) {
				fatalError('No password provided.');
				return;
			}

			let mk: Buffer | null = null;
			for (const slot of lockbox.slots) {
				try {
					mk = unwrapSlot(slot, password);
					break;
				} catch {}
			}

			if (!mk) {
				fatalError('No slot could be unlocked with the provided password.');
				return;
			}

			const content = fs.readFileSync(file, 'utf-8');
			const envelope = aesEncrypt(content, mk);
			saveEnvelope(envelope);
			console.log(chalk.green('.env.enc created successfully.'));
		});

	program
		.command('run')
		.description('Decrypt secrets and inject into a child process')
		.argument('<command...>', 'Command to execute')
		.allowUnknownOption()
		.passThroughOptions()
		.action(async (commandParts: string[]) => {
			const lockbox = loadLockbox();
			if (!lockbox) {
				fatalError('No env-lock.json found. Run "env-lock init" first.');
				return;
			}

			const envelope = loadEnvelope();
			if (!envelope) {
				fatalError('No .env.enc found. Run "env-lock seal" first.');
				return;
			}

			const password = await getPassword();
			if (!password) {
				fatalError('No password provided.');
				return;
			}

			let mk: Buffer | null = null;
			for (const slot of lockbox.slots) {
				try {
					mk = unwrapSlot(slot, password);
					break;
				} catch {}
			}

			if (!mk) {
				fatalError('No slot could be unlocked with the provided password.');
				return;
			}

			const plaintext = aesDecrypt(envelope, mk);
			const secrets = parseEnv(plaintext);
			const fullCommand = commandParts.join(' ');
			const exitCode = executeWithSecrets(fullCommand, secrets);
			process.exitCode = exitCode;
		});

	program
		.command('rotate')
		.description('Rotate master key and remove all other slots')
		.action(async () => {
			const lockbox = loadLockbox();
			if (!lockbox) {
				fatalError('No env-lock.json found. Run "env-lock init" first.');
				return;
			}

			const envelope = loadEnvelope();
			if (!envelope) {
				fatalError('No .env.enc found. Run "env-lock seal" first.');
				return;
			}

			const password = await getPassword();
			if (!password) {
				fatalError('No password provided.');
				return;
			}

			let oldMk: Buffer | null = null;
			let matchedSlotId: string | null = null;
			for (const slot of lockbox.slots) {
				try {
					oldMk = unwrapSlot(slot, password);
					matchedSlotId = slot.id;
					break;
				} catch {}
			}

			if (!oldMk || !matchedSlotId) {
				fatalError('No slot could be unlocked with the provided password.');
				return;
			}

			const plaintext = aesDecrypt(envelope, oldMk);
			const newMk = generateMasterKey();
			const newEnvelope = aesEncrypt(plaintext, newMk);
			saveEnvelope(newEnvelope);

			const newSlot = createSlot(newMk, password, matchedSlotId);
			const newLockbox: Lockbox = { version: 1, slots: [newSlot] };
			saveLockbox(newLockbox);

			console.log(chalk.green('Master key rotated successfully.'));
			console.log(
				chalk.yellow(
					'All other slots removed. Re-add team members with the TUI.',
				),
			);
		});

	try {
		await program.parseAsync(args, { from: 'user' });
	} catch (err: unknown) {
		if (err instanceof Error && 'exitCode' in err) {
			process.exitCode = getExitCode(err);
		} else {
			fatalError(formatError(err));
		}
	}
}

runIfMain(import.meta.url, () => {
	runCLI();
});
