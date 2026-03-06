import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './index.js';

describe('ConfirmDialog', () => {
	it('renders the message', () => {
		const { lastFrame } = render(
			<ConfirmDialog
				message="Delete this item?"
				onConfirm={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		expect(lastFrame()).toContain('Delete this item?');
	});

	it('calls onConfirm when y is pressed', async () => {
		const delay = () => new Promise((r) => setTimeout(r, 50));
		const onConfirm = vi.fn();
		const { stdin } = render(
			<ConfirmDialog
				message="Proceed?"
				onConfirm={onConfirm}
				onCancel={vi.fn()}
			/>,
		);
		await delay();

		stdin.write('y');
		await delay();

		expect(onConfirm).toHaveBeenCalled();
	});

	it('calls onCancel when n is pressed', async () => {
		const delay = () => new Promise((r) => setTimeout(r, 50));
		const onCancel = vi.fn();
		const { stdin } = render(
			<ConfirmDialog
				message="Proceed?"
				onConfirm={vi.fn()}
				onCancel={onCancel}
			/>,
		);
		await delay();

		stdin.write('n');
		await delay();

		expect(onCancel).toHaveBeenCalled();
	});

	it('calls onCancel on Escape', async () => {
		const delay = () => new Promise((r) => setTimeout(r, 50));
		const onCancel = vi.fn();
		const { stdin } = render(
			<ConfirmDialog
				message="Proceed?"
				onConfirm={vi.fn()}
				onCancel={onCancel}
			/>,
		);
		await delay();

		stdin.write('\u001B');
		await delay();

		expect(onCancel).toHaveBeenCalled();
	});
});
