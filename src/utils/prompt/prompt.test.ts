import { Readable, Writable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { promptPassword } from './index.js';

function createMockReadable(input: string): Readable {
	const readable = new Readable({
		read() {
			this.push(input);
			this.push(null);
		},
	});
	return readable;
}

function createMockWritable(): Writable & { output: string } {
	const writable = new Writable({
		write(chunk, _encoding, callback) {
			(writable as Writable & { output: string }).output += chunk.toString();
			callback();
		},
	}) as Writable & { output: string };
	writable.output = '';
	return writable;
}

describe('promptPassword', () => {
	it('returns the entered password', async () => {
		const input = createMockReadable('my-secret\n');
		const output = createMockWritable();

		const password = await promptPassword('Enter password: ', {
			input,
			output,
		});

		expect(password).toBe('my-secret');
	});

	it('displays the prompt message', async () => {
		const input = createMockReadable('pass\n');
		const output = createMockWritable();

		await promptPassword('Password: ', { input, output });

		expect(output.output).toContain('Password: ');
	});
});
