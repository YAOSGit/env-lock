import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';
import type { Slot } from '../../types/Slot/index.js';
import { SlotList } from './index.js';

const baseSlots: Slot[] = [
	{
		id: 'alice@test.com',
		kdf: 'pbkdf2',
		salt: 'salt==',
		iterations: 600000,
		wrappedKey: 'key==',
		wrappingIv: 'iv==',
		wrappingTag: 'tag==',
		createdAt: '2026-01-15T10:00:00.000Z',
	},
	{
		id: 'bob@test.com',
		kdf: 'pbkdf2',
		salt: 'salt2==',
		iterations: 600000,
		wrappedKey: 'key2==',
		wrappingIv: 'iv2==',
		wrappingTag: 'tag2==',
		createdAt: '2026-02-20T14:30:00.000Z',
	},
];

describe('SlotList', () => {
	it('renders slot IDs', () => {
		const { lastFrame } = render(
			<SlotList slots={baseSlots} onAddSlot={vi.fn()} onRemoveSlot={vi.fn()} />,
		);
		expect(lastFrame()).toContain('alice@test.com');
		expect(lastFrame()).toContain('bob@test.com');
	});

	it('shows kdf algorithm', () => {
		const { lastFrame } = render(
			<SlotList slots={baseSlots} onAddSlot={vi.fn()} onRemoveSlot={vi.fn()} />,
		);
		expect(lastFrame()).toContain('pbkdf2');
	});

	it('calls onRemoveSlot when d then y is pressed', async () => {
		const delay = () => new Promise((r) => setTimeout(r, 50));
		const onRemoveSlot = vi.fn();
		const { stdin } = render(
			<SlotList
				slots={baseSlots}
				onAddSlot={vi.fn()}
				onRemoveSlot={onRemoveSlot}
			/>,
		);
		await delay();

		stdin.write('d');
		await delay();
		stdin.write('y');
		await delay();

		expect(onRemoveSlot).toHaveBeenCalledWith('alice@test.com');
	});

	it('shows empty state', () => {
		const { lastFrame } = render(
			<SlotList slots={[]} onAddSlot={vi.fn()} onRemoveSlot={vi.fn()} />,
		);
		expect(lastFrame()).toContain('No slots');
	});
});
