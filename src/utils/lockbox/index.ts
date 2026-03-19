import fs from 'node:fs';
import path from 'node:path';
import { atomicWrite } from '@yaos-git/toolkit/cli';
import type { Lockbox } from '../../types/Lockbox/index.js';

const DEFAULT_FILENAME = 'env-lock.json';

export function getLockboxPath(dir?: string): string {
	return path.resolve(dir ?? process.cwd(), DEFAULT_FILENAME);
}

export function loadLockbox(filePath?: string): Lockbox | null {
	const resolved = filePath ?? getLockboxPath();

	if (!fs.existsSync(resolved)) {
		return null;
	}

	const raw = fs.readFileSync(resolved, 'utf-8');
	const parsed = JSON.parse(raw);

	if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.slots)) {
		throw new Error(`Invalid lockbox file: ${resolved}`);
	}

	return parsed as Lockbox;
}

export function saveLockbox(lockbox: Lockbox, filePath?: string): void {
	const resolved = filePath ?? getLockboxPath();
	const dir = path.dirname(resolved);

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	atomicWrite(resolved, JSON.stringify(lockbox, null, '\t'));
}
