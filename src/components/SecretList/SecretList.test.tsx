import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';

const mockRequestConfirmation = vi.fn((_message: string, onConfirm: () => void) => {
	// auto-confirm when tests trigger confirmation
	onConfirm();
});

vi.mock('../../providers/UIStateProvider/index.js', () => ({
	useUIStateContext: () => ({
		activeOverlay: 'none',
		setActiveOverlay: vi.fn(),
		confirmation: null,
		requestConfirmation: mockRequestConfirmation,
		clearConfirmation: vi.fn(),
		cycleFocus: vi.fn(),
		inputActive: false,
		setInputActive: vi.fn(),
		activeTab: 'secrets',
		setActiveTab: vi.fn(),
	}),
}));

import { SecretList } from './index.js';

describe('SecretList', () => {
	const baseSecrets = {
		DATABASE_URL: 'postgres://localhost/db',
		API_KEY: 'sk-abc123',
		REDIS_HOST: '127.0.0.1',
	};

	it('renders secret keys and values', () => {
		const { lastFrame } = render(
			<SecretList
				secrets={baseSecrets}
				isDirty={false}
				onEdit={vi.fn()}
				onAdd={vi.fn()}
				onDelete={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		expect(lastFrame()).toContain('DATABASE_URL');
		expect(lastFrame()).toContain('API_KEY');
		expect(lastFrame()).toContain('REDIS_HOST');
	});

	it('shows empty state when no secrets', () => {
		const { lastFrame } = render(
			<SecretList
				secrets={{}}
				isDirty={false}
				onEdit={vi.fn()}
				onAdd={vi.fn()}
				onDelete={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		expect(lastFrame()).toContain('No secrets');
	});

	it('calls onDelete when d is pressed then confirmed', async () => {
		const delay = () => new Promise((r) => setTimeout(r, 50));
		const onDelete = vi.fn();
		const { stdin } = render(
			<SecretList
				secrets={baseSecrets}
				isDirty={false}
				onEdit={vi.fn()}
				onAdd={vi.fn()}
				onDelete={onDelete}
				onSave={vi.fn()}
			/>,
		);
		await delay();

		stdin.write('d');
		await delay();
		stdin.write('y');
		await delay();

		expect(onDelete).toHaveBeenCalledWith('DATABASE_URL');
	});

	it('navigates with arrow keys', async () => {
		const delay = () => new Promise((r) => setTimeout(r, 50));
		const onDelete = vi.fn();
		const { stdin } = render(
			<SecretList
				secrets={baseSecrets}
				isDirty={false}
				onEdit={vi.fn()}
				onAdd={vi.fn()}
				onDelete={onDelete}
				onSave={vi.fn()}
			/>,
		);
		await delay();

		stdin.write('\u001B[B'); // down arrow
		await delay();
		stdin.write('d');
		await delay();
		stdin.write('y');
		await delay();

		expect(onDelete).toHaveBeenCalledWith('API_KEY');
	});
});
