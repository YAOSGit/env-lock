import { spawnSync } from 'node:child_process';
import os from 'node:os';
import type { EnvMap } from '../../types/EnvSchema/index.js';

export type ParsedCommand = {
	program: string;
	args: string[];
};

export function parseCommandLine(command: string): ParsedCommand {
	const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
	const parts: string[] = [];
	let match: RegExpExecArray | null;

	while (true) {
		match = regex.exec(command);
		if (match === null) break;
		parts.push(match[1] ?? match[2] ?? match[0]);
	}

	if (parts.length === 0) {
		return { program: '', args: [] };
	}

	return { program: parts[0], args: parts.slice(1) };
}

export function buildSpawnEnv(secrets: EnvMap): Record<string, string> {
	return { ...process.env, ...secrets } as Record<string, string>;
}

/**
 * Execute a command with injected secrets in the environment.
 * NOTE: Cannot delegate to toolkit's spawnCommand because it does not
 * support custom env injection — env-lock's core use-case.
 */
export function executeWithSecrets(command: string, secrets: EnvMap): number {
	const parsed = parseCommandLine(command);
	const env = buildSpawnEnv(secrets);

	const result = spawnSync(parsed.program, parsed.args, {
		stdio: 'inherit',
		env,
		cwd: process.cwd(),
	});

	if (result.error) {
		console.error(`Failed to execute: ${command}`);
		console.error(result.error.message);
		return 1;
	}

	if (result.signal) {
		const sigNum = os.constants.signals[result.signal];
		return 128 + (sigNum ?? 0);
	}

	return result.status ?? 1;
}
