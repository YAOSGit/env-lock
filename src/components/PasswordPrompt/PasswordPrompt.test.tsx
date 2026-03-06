import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';
import { PasswordPrompt } from './index.js';

describe('PasswordPrompt', () => {
	it('renders the prompt message', () => {
		const { lastFrame } = render(<PasswordPrompt onSubmit={vi.fn()} />);
		expect(lastFrame()).toContain('Password');
	});

	it('masks input with asterisks', async () => {
		const delay = () => new Promise((r) => setTimeout(r, 50));
		const { stdin, lastFrame } = render(<PasswordPrompt onSubmit={vi.fn()} />);
		await delay();

		stdin.write('abc');
		await delay();

		expect(lastFrame()).toContain('***');
		expect(lastFrame()).not.toContain('abc');
	});

	it('calls onSubmit with password on Enter', async () => {
		const delay = () => new Promise((r) => setTimeout(r, 50));
		const onSubmit = vi.fn();
		const { stdin } = render(<PasswordPrompt onSubmit={onSubmit} />);
		await delay();

		stdin.write('my-pass');
		await delay();
		stdin.write('\r');
		await delay();

		expect(onSubmit).toHaveBeenCalledWith('my-pass');
	});

	it('displays error message when provided', () => {
		const { lastFrame } = render(
			<PasswordPrompt onSubmit={vi.fn()} error="Invalid password" />,
		);
		expect(lastFrame()).toContain('Invalid password');
	});
});
