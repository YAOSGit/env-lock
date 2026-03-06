import { describe, expect, it } from 'vitest';
import { aesDecrypt, aesEncrypt } from './index.js';

describe('AES-256-GCM', () => {
	const key = Buffer.alloc(32, 'a'); // 256-bit key

	it('encrypts and decrypts a payload round-trip', () => {
		const plaintext = 'DATABASE_URL=postgres://localhost/db';
		const envelope = aesEncrypt(plaintext, key);

		expect(envelope.ciphertext).toBeTruthy();
		expect(envelope.iv).toBeTruthy();
		expect(envelope.tag).toBeTruthy();
		expect(envelope.ciphertext).not.toBe(plaintext);

		const decrypted = aesDecrypt(envelope, key);
		expect(decrypted).toBe(plaintext);
	});

	it('fails decryption with wrong key', () => {
		const plaintext = 'SECRET=value';
		const envelope = aesEncrypt(plaintext, key);
		const wrongKey = Buffer.alloc(32, 'b');

		expect(() => aesDecrypt(envelope, wrongKey)).toThrow();
	});

	it('fails decryption with tampered ciphertext', () => {
		const plaintext = 'SECRET=value';
		const envelope = aesEncrypt(plaintext, key);
		const tampered = {
			...envelope,
			ciphertext: Buffer.from('tampered').toString('base64'),
		};

		expect(() => aesDecrypt(tampered, key)).toThrow();
	});

	it('produces unique IVs per encryption', () => {
		const plaintext = 'SAME=value';
		const e1 = aesEncrypt(plaintext, key);
		const e2 = aesEncrypt(plaintext, key);

		expect(e1.iv).not.toBe(e2.iv);
		expect(e1.ciphertext).not.toBe(e2.ciphertext);
	});
});
