import { assertType, describe, it } from 'vitest';
import type { EnvEntry, EnvMap } from './index.js';

describe('EnvSchema types', () => {
	it('accepts a valid EnvEntry', () => {
		assertType<EnvEntry>({ key: 'DATABASE_URL', value: 'postgres://...' });
	});

	it('accepts a valid EnvMap', () => {
		assertType<EnvMap>({ DATABASE_URL: 'postgres://...', API_KEY: 'secret' });
	});
});
