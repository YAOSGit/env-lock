import { describe, expect, it } from 'vitest';
import { deriveKey, generateSalt } from './index.js';

describe('KDF', () => {
	it('generates a 32-byte salt', () => {
		const salt = generateSalt();
		expect(Buffer.from(salt, 'base64')).toHaveLength(32);
	});

	it('derives a 32-byte key from password using pbkdf2', () => {
		const salt = generateSalt();
		const key = deriveKey('my-password', salt, {
			algorithm: 'pbkdf2',
			iterations: 100_000,
		});
		expect(key).toHaveLength(32);
	});

	it('produces deterministic output for same password+salt', () => {
		const salt = generateSalt();
		const k1 = deriveKey('password', salt, {
			algorithm: 'pbkdf2',
			iterations: 100_000,
		});
		const k2 = deriveKey('password', salt, {
			algorithm: 'pbkdf2',
			iterations: 100_000,
		});
		expect(k1.equals(k2)).toBe(true);
	});

	it('produces different output for different passwords', () => {
		const salt = generateSalt();
		const k1 = deriveKey('password-a', salt, {
			algorithm: 'pbkdf2',
			iterations: 100_000,
		});
		const k2 = deriveKey('password-b', salt, {
			algorithm: 'pbkdf2',
			iterations: 100_000,
		});
		expect(k1.equals(k2)).toBe(false);
	});

	it('produces different output for different salts', () => {
		const s1 = generateSalt();
		const s2 = generateSalt();
		const k1 = deriveKey('password', s1, {
			algorithm: 'pbkdf2',
			iterations: 100_000,
		});
		const k2 = deriveKey('password', s2, {
			algorithm: 'pbkdf2',
			iterations: 100_000,
		});
		expect(k1.equals(k2)).toBe(false);
	});
});
