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

	it('rotate re-keys and preserves secrets', () => {
		fs.writeFileSync(path.join(tmpDir, '.env'), 'ROTATE_TEST=rotated\n');

		run(['init', 'admin@test.com'], { ENV_LOCK_PASSWORD: 'pass1' });
		run(['seal', '.env'], { ENV_LOCK_PASSWORD: 'pass1' });

		const rotateOutput = run(['rotate'], { ENV_LOCK_PASSWORD: 'pass1' });
		expect(rotateOutput).toContain('Master key rotated');
		expect(rotateOutput).toContain('All other slots removed');

		// Secrets still accessible with same password
		const runOutput = run(
			['run', 'node', '-e', 'console.log(process.env.ROTATE_TEST)'],
			{ ENV_LOCK_PASSWORD: 'pass1' },
		);
		expect(runOutput.trim()).toBe('rotated');

		// Lockbox has only one slot
		const lockbox = JSON.parse(
			fs.readFileSync(path.join(tmpDir, 'env-lock.json'), 'utf-8'),
		);
		expect(lockbox.slots).toHaveLength(1);
		expect(lockbox.slots[0].id).toBe('admin@test.com');
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
