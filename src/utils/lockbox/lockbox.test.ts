import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Lockbox } from '../../types/Lockbox/index.js';
import { loadLockbox, saveLockbox } from './index.js';

describe('lockbox read/write', () => {
	let tmpDir: string;

	beforeEach(() => {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'env-lock-test-'));
	});

	afterEach(() => {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	it('saves and loads a lockbox round-trip', () => {
		const lockbox: Lockbox = {
			version: 1,
			slots: [
				{
					id: 'test@example.com',
					kdf: 'pbkdf2',
					salt: 'abc',
					iterations: 100_000,
					wrappedKey: 'key',
					wrappingIv: 'iv',
					wrappingTag: 'tag',
					createdAt: '2026-01-01T00:00:00.000Z',
				},
			],
		};

		const filePath = path.join(tmpDir, 'env-lock.json');
		saveLockbox(lockbox, filePath);
		const loaded = loadLockbox(filePath);
		expect(loaded).toEqual(lockbox);
	});

	it('returns null when file does not exist', () => {
		const filePath = path.join(tmpDir, 'nonexistent.json');
		const loaded = loadLockbox(filePath);
		expect(loaded).toBeNull();
	});

	it('throws on malformed JSON', () => {
		const filePath = path.join(tmpDir, 'env-lock.json');
		fs.writeFileSync(filePath, 'not json');
		expect(() => loadLockbox(filePath)).toThrow();
	});
});
