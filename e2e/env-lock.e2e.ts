import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('env-lock E2E', () => {
	let tmpDir: string;
	const cliPath = path.resolve(import.meta.dirname, '../dist/cli.js');

	beforeEach(() => {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'env-lock-e2e-'));
	});

	afterEach(() => {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	function run(args: string[], env: Record<string, string> = {}): string {
		return execFileSync('node', [cliPath, ...args], {
			cwd: tmpDir,
			env: { ...process.env, ...env },
			encoding: 'utf-8',
			timeout: 10_000,
		});
	}

	it('full cycle: init -> seal -> run', () => {
		fs.writeFileSync(path.join(tmpDir, '.env'), 'TEST_SECRET=hello-world\n');

		const initOutput = run(['init', 'e2e@test.com'], {
			ENV_LOCK_PASSWORD: 'test123',
		});
		expect(initOutput).toContain('Lockbox initialized');
		expect(fs.existsSync(path.join(tmpDir, 'env-lock.json'))).toBe(true);

		const sealOutput = run(['seal', '.env'], { ENV_LOCK_PASSWORD: 'test123' });
		expect(sealOutput).toContain('.env.enc created');
		expect(fs.existsSync(path.join(tmpDir, '.env.enc'))).toBe(true);

		const runOutput = run(
			['run', 'node', '-e', 'console.log(process.env.TEST_SECRET)'],
			{
				ENV_LOCK_PASSWORD: 'test123',
			},
		);
		expect(runOutput.trim()).toBe('hello-world');
	});

	it('run fails without ENV_LOCK_PASSWORD', () => {
		fs.writeFileSync(path.join(tmpDir, '.env'), 'KEY=value\n');
		run(['init', 'user@test.com'], { ENV_LOCK_PASSWORD: 'pass' });
		run(['seal', '.env'], { ENV_LOCK_PASSWORD: 'pass' });

		expect(() =>
			run(['run', 'echo', 'hello'], { ENV_LOCK_PASSWORD: '' }),
		).toThrow();
	});
});
