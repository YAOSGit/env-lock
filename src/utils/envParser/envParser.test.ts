import { describe, expect, it } from 'vitest';
import { parseEnv, serializeEnv } from './index.js';

describe('envParser', () => {
	it('parses KEY=VALUE pairs', () => {
		const input = 'DB_HOST=localhost\nDB_PORT=5432';
		const result = parseEnv(input);
		expect(result).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
	});

	it('handles quoted values', () => {
		const input = 'SECRET="has spaces"\nOTHER=\'single quoted\'';
		const result = parseEnv(input);
		expect(result).toEqual({ SECRET: 'has spaces', OTHER: 'single quoted' });
	});

	it('skips comments and empty lines', () => {
		const input = '# comment\n\nKEY=value\n  # another comment';
		const result = parseEnv(input);
		expect(result).toEqual({ KEY: 'value' });
	});

	it('handles values with = signs', () => {
		const input = 'URL=postgres://user:pass@host/db?opt=val';
		const result = parseEnv(input);
		expect(result).toEqual({ URL: 'postgres://user:pass@host/db?opt=val' });
	});

	it('serializes env map back to string', () => {
		const env = { A: 'simple', B: 'has spaces', C: 'has"quote' };
		const output = serializeEnv(env);
		const reparsed = parseEnv(output);
		expect(reparsed).toEqual(env);
	});
});
