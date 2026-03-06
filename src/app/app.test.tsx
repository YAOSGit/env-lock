import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../utils/lockbox/index.js', () => ({
	loadLockbox: vi.fn().mockReturnValue({
		version: 1,
		slots: [
			{
				id: 'test@test.com',
				kdf: 'pbkdf2',
				salt: 'c2FsdA==',
				iterations: 100,
				wrappedKey: 'key==',
				wrappingIv: 'iv==',
				wrappingTag: 'tag==',
				createdAt: '2026-01-01T00:00:00.000Z',
			},
		],
	}),
	saveLockbox: vi.fn(),
}));

vi.mock('../utils/envelope/index.js', () => ({
	loadEnvelope: vi.fn().mockReturnValue(null),
	saveEnvelope: vi.fn(),
}));

vi.mock('../crypto/slot/index.js', () => ({
	unwrapSlot: vi.fn().mockImplementation(() => {
		throw new Error('wrong password');
	}),
	createSlot: vi.fn(),
}));

import { App } from './index.js';

describe('App', () => {
	it('shows password prompt when not unlocked via env var', () => {
		delete process.env.ENV_LOCK_PASSWORD;
		const { lastFrame } = render(<App />);
		expect(lastFrame()).toContain('Password');
	});

	it('shows env-lock branding', () => {
		const { lastFrame } = render(<App />);
		expect(lastFrame()).toContain('env-lock');
	});
});
