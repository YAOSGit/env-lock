import { pbkdf2Sync, randomBytes } from 'node:crypto';
import type { KdfAlgorithm } from '../../types/Slot/index.js';

export type KdfOptions = {
	algorithm: KdfAlgorithm;
	iterations: number;
};

const KEY_LENGTH = 32;
const SALT_LENGTH = 32;

export function generateSalt(): string {
	return randomBytes(SALT_LENGTH).toString('base64');
}

export function deriveKey(
	password: string,
	salt: string,
	options: KdfOptions,
): Buffer {
	const saltBuffer = Buffer.from(salt, 'base64');

	if (options.algorithm === 'pbkdf2') {
		return pbkdf2Sync(
			password,
			saltBuffer,
			options.iterations,
			KEY_LENGTH,
			'sha512',
		);
	}

	// Argon2id — use Node 20+ crypto.hash or fall back to pbkdf2
	// Node 18 doesn't have native argon2id, so we use pbkdf2 as fallback
	return pbkdf2Sync(
		password,
		saltBuffer,
		options.iterations,
		KEY_LENGTH,
		'sha512',
	);
}
