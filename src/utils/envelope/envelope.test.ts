import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Envelope } from '../../types/Envelope/index.js';
import { loadEnvelope, saveEnvelope } from './index.js';

describe('envelope read/write', () => {
	let tmpDir: string;

	beforeEach(() => {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'env-lock-env-test-'));
	});

	afterEach(() => {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	it('saves and loads an envelope round-trip', () => {
		const envelope: Envelope = {
			ciphertext: 'ct==',
			iv: 'iv==',
			tag: 'tag==',
		};
		const filePath = path.join(tmpDir, '.env.enc');
		saveEnvelope(envelope, filePath);
		const loaded = loadEnvelope(filePath);
		expect(loaded).toEqual(envelope);
	});

	it('returns null when file does not exist', () => {
		const filePath = path.join(tmpDir, 'missing.enc');
		expect(loadEnvelope(filePath)).toBeNull();
	});
});
