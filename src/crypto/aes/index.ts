import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import type { Envelope } from '../../types/Envelope/index.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

export function aesEncrypt(plaintext: string, key: Buffer): Envelope {
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, key, iv);

	const encrypted = Buffer.concat([
		cipher.update(plaintext, 'utf-8'),
		cipher.final(),
	]);

	const tag = cipher.getAuthTag();

	return {
		ciphertext: encrypted.toString('base64'),
		iv: iv.toString('base64'),
		tag: tag.toString('base64'),
	};
}

export function aesDecrypt(envelope: Envelope, key: Buffer): string {
	const iv = Buffer.from(envelope.iv, 'base64');
	const tag = Buffer.from(envelope.tag, 'base64');
	const ciphertext = Buffer.from(envelope.ciphertext, 'base64');

	const decipher = createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(tag);

	const decrypted = Buffer.concat([
		decipher.update(ciphertext),
		decipher.final(),
	]);

	return decrypted.toString('utf-8');
}
