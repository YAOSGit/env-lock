import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as envelopeModule from '../utils/envelope/index.js';
import * as lockboxModule from '../utils/lockbox/index.js';

vi.mock('../utils/lockbox/index.js', () => ({
	loadLockbox: vi.fn(),
	saveLockbox: vi.fn(),
	getLockboxPath: vi.fn().mockReturnValue('/fake/env-lock.json'),
}));

vi.mock('../utils/envelope/index.js', () => ({
	loadEnvelope: vi.fn(),
	saveEnvelope: vi.fn(),
	getEnvelopePath: vi.fn().mockReturnValue('/fake/.env.enc'),
}));

vi.mock('../utils/executor/index.js', () => ({
	executeWithSecrets: vi.fn().mockReturnValue(0),
	parseCommandLine: vi.fn(),
	buildSpawnEnv: vi.fn(),
}));

vi.mock('../utils/prompt/index.js', () => ({
	promptPassword: vi.fn().mockResolvedValue('test-password'),
}));

import { runCLI } from './cli.js';

describe('CLI', () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;
	let _consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		process.exitCode = undefined;
		consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		_consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('prints version with --version', async () => {
		await runCLI(['--version']);
		expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('.'));
	});

	it('prints help with --help', async () => {
		await runCLI(['--help']);
		expect(consoleLogSpy).toHaveBeenCalled();
	});

	it('errors when running without a lockbox', async () => {
		vi.mocked(lockboxModule.loadLockbox).mockReturnValue(null);
		await runCLI(['run', '--', 'echo', 'hello']);
		expect(process.exitCode).toBe(1);
	});

	it('does not have add-member command', async () => {
		await runCLI(['add-member', 'someone']);
		expect(process.exitCode).toBe(1);
	});

	it('rotate fails without lockbox', async () => {
		vi.mocked(lockboxModule.loadLockbox).mockReturnValue(null);
		await runCLI(['rotate']);
		expect(process.exitCode).toBe(1);
	});

	it('rotate fails without envelope', async () => {
		vi.mocked(lockboxModule.loadLockbox).mockReturnValue({
			version: 1,
			slots: [
				{
					id: 'admin',
					kdf: 'pbkdf2',
					salt: 'c2FsdA==',
					iterations: 600000,
					wrappedKey: 'key==',
					wrappingIv: 'iv==',
					wrappingTag: 'tag==',
					createdAt: '2026-01-01T00:00:00.000Z',
				},
			],
		});
		vi.mocked(envelopeModule.loadEnvelope).mockReturnValue(null);
		await runCLI(['rotate']);
		expect(process.exitCode).toBe(1);
	});
});
