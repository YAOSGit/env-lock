import { renderHook } from '@testing-library/react';
import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/lockbox/index.js', () => ({
	loadLockbox: vi.fn().mockReturnValue({ version: 1, slots: [] }),
	saveLockbox: vi.fn(),
}));

vi.mock('../../utils/envelope/index.js', () => ({
	loadEnvelope: vi.fn().mockReturnValue(null),
	saveEnvelope: vi.fn(),
}));

import { LockboxProvider } from '../../providers/LockboxProvider/index.js';
import { SecretProvider } from '../../providers/SecretProvider/index.js';
import { useSecrets } from './index.js';

function TestComponent() {
	const { secrets, isDirty, isUnlocked } = useSecrets();
	const count = Object.keys(secrets).length;
	return (
		<Box flexDirection="column">
			<Text>secrets:{count}</Text>
			<Text>dirty:{isDirty ? 'yes' : 'no'}</Text>
			<Text>unlocked:{isUnlocked ? 'yes' : 'no'}</Text>
		</Box>
	);
}

describe('useSecrets', () => {
	it('provides initial empty state', () => {
		const { lastFrame } = render(
			<LockboxProvider>
				<SecretProvider>
					<TestComponent />
				</SecretProvider>
			</LockboxProvider>,
		);
		expect(lastFrame()).toContain('secrets:0');
		expect(lastFrame()).toContain('dirty:no');
		expect(lastFrame()).toContain('unlocked:no');
	});

	it('throws when used outside provider', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => {
			renderHook(() => useSecrets());
		}).toThrow('useSecrets must be used within a SecretProvider');
		spy.mockRestore();
	});
});
