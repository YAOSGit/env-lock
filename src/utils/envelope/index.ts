import fs from 'node:fs';
import path from 'node:path';
import { atomicWrite } from '@yaos-git/toolkit/cli';
import type { Envelope } from '../../types/Envelope/index.js';

const DEFAULT_FILENAME = '.env.enc';

export function getEnvelopePath(dir?: string): string {
	return path.resolve(dir ?? process.cwd(), DEFAULT_FILENAME);
}

export function loadEnvelope(filePath?: string): Envelope | null {
	const resolved = filePath ?? getEnvelopePath();

	if (!fs.existsSync(resolved)) {
		return null;
	}

	const raw = fs.readFileSync(resolved, 'utf-8');
	return JSON.parse(raw) as Envelope;
}

export function saveEnvelope(envelope: Envelope, filePath?: string): void {
	const resolved = filePath ?? getEnvelopePath();

	atomicWrite(resolved, JSON.stringify(envelope, null, '\t'));
}
