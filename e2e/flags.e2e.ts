import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const CLI = path.resolve(import.meta.dirname, '../dist/cli.js');

describe('env-lock CLI flags', () => {
	let tmpDir: string;

	beforeEach(() => {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'env-lock-e2e-flags-'));
	});

	afterEach(() => {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	function run(args: string[]): { stdout: string; stderr: string; exitCode: number } {
		try {
			const stdout = execFileSync('node', [CLI, ...args], {
				cwd: tmpDir,
				encoding: 'utf-8',
				timeout: 10_000,
			});
			return { stdout, stderr: '', exitCode: 0 };
		} catch (err: unknown) {
			const e = err as { stdout?: string; stderr?: string; status?: number };
			return {
				stdout: e.stdout ?? '',
				stderr: e.stderr ?? '',
				exitCode: e.status ?? 1,
			};
		}
	}

	it('--help shows usage text with "env-lock" and subcommands', () => {
		const { stdout, exitCode } = run(['--help']);
		expect(exitCode).toBe(0);
		expect(stdout).toContain('env-lock');
		expect(stdout).toContain('init');
		expect(stdout).toContain('seal');
		expect(stdout).toContain('run');
		expect(stdout).toContain('rotate');
	});

	it('--version shows version string', () => {
		const { stdout, exitCode } = run(['--version']);
		expect(exitCode).toBe(0);
		expect(stdout).toContain('env-lock/');
	});

	it('init --help shows init options', () => {
		const { stdout, exitCode } = run(['init', '--help']);
		expect(exitCode).toBe(0);
		expect(stdout).toContain('init');
		expect(stdout).toContain('slot-id');
	});

	it('seal --help shows seal options', () => {
		const { stdout, exitCode } = run(['seal', '--help']);
		expect(exitCode).toBe(0);
		expect(stdout).toContain('seal');
		expect(stdout).toContain('file');
	});

	it('run --help shows run options', () => {
		const { stdout, exitCode } = run(['run', '--help']);
		expect(exitCode).toBe(0);
		expect(stdout).toContain('run');
		expect(stdout).toContain('command');
	});

	it('rotate --help shows rotate options', () => {
		const { stdout, exitCode } = run(['rotate', '--help']);
		expect(exitCode).toBe(0);
		expect(stdout).toContain('rotate');
		expect(stdout).toContain('Rotate master key');
	});

	it('run without setup produces meaningful error', () => {
		const { stderr, exitCode } = run(['run', 'echo', 'hello']);
		expect(exitCode).toBe(1);
		expect(stderr).toContain('No env-lock.json found');
	});

	it('seal without lockbox produces meaningful error', () => {
		const { stderr, exitCode } = run(['seal', '.env']);
		expect(exitCode).toBe(1);
		expect(stderr).toContain('No env-lock.json found');
	});
});
