import { renderHook } from '@testing-library/react';
import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/lockbox/index.js', () => ({
	loadLockbox: vi.fn().mockReturnValue({
		version: 1,
		slots: [
			{
				id: 'alice@test.com',
				kdf: 'pbkdf2',
				salt: 'base64salt==',
				iterations: 600000,
				wrappedKey: 'key==',
				wrappingIv: 'iv==',
				wrappingTag: 'tag==',
				createdAt: '2026-01-01T00:00:00.000Z',
			},
		],
	}),
	saveLockbox: vi.fn(),
}));

import { LockboxProvider } from '../../providers/LockboxProvider/index.js';
import { useLockbox } from './index.js';

function TestComponent() {
	const { lockbox } = useLockbox();
	return (
		<Box>
			<Text>{lockbox?.slots.length ?? 0} slots</Text>
		</Box>
	);
}

describe('useLockbox', () => {
	it('provides lockbox state from provider', () => {
		const { lastFrame } = render(
			<LockboxProvider>
				<TestComponent />
			</LockboxProvider>,
		);
		expect(lastFrame()).toContain('1 slots');
	});

	it('throws when used outside provider', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => {
			renderHook(() => useLockbox());
		}).toThrow('useLockbox must be used within a LockboxProvider');
		spy.mockRestore();
	});
});
