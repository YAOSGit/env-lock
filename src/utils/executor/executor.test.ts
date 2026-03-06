import { describe, expect, it } from 'vitest';
import { buildSpawnEnv, parseCommandLine } from './index.js';

describe('executor', () => {
	it('parses a simple command', () => {
		const result = parseCommandLine('npm run dev');
		expect(result).toEqual({ program: 'npm', args: ['run', 'dev'] });
	});

	it('parses quoted arguments', () => {
		const result = parseCommandLine('echo "hello world"');
		expect(result).toEqual({ program: 'echo', args: ['hello world'] });
	});

	it('merges secrets into process.env', () => {
		const secrets = { SECRET_A: 'val-a', SECRET_B: 'val-b' };
		const env = buildSpawnEnv(secrets);
		expect(env.SECRET_A).toBe('val-a');
		expect(env.SECRET_B).toBe('val-b');
		expect(env.PATH).toBe(process.env.PATH);
	});

	it('secrets override existing env vars', () => {
		const secrets = { HOME: '/overridden' };
		const env = buildSpawnEnv(secrets);
		expect(env.HOME).toBe('/overridden');
	});
});
