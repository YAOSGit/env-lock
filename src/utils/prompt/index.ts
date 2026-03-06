import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';

export type PromptOptions = {
	input?: Readable;
	output?: Writable;
};

export function promptPassword(
	message: string,
	options: PromptOptions = {},
): Promise<string> {
	const input = options.input ?? process.stdin;
	const output = options.output ?? process.stdout;

	output.write(message);

	// If stdin supports raw mode, use it for masked input
	if (
		'setRawMode' in input &&
		typeof (input as NodeJS.ReadStream).setRawMode === 'function'
	) {
		const ttyInput = input as NodeJS.ReadStream;
		return new Promise((resolve) => {
			let password = '';
			ttyInput.setRawMode(true);
			ttyInput.resume();
			ttyInput.setEncoding('utf-8');

			const onData = (char: string) => {
				const c = char.toString();
				if (c === '\n' || c === '\r') {
					ttyInput.setRawMode(false);
					ttyInput.pause();
					ttyInput.removeListener('data', onData);
					output.write('\n');
					resolve(password);
				} else if (c === '\u0003') {
					// Ctrl+C
					ttyInput.setRawMode(false);
					ttyInput.pause();
					ttyInput.removeListener('data', onData);
					process.exit(1);
				} else if (c === '\u007F' || c === '\b') {
					// Backspace
					if (password.length > 0) {
						password = password.slice(0, -1);
						output.write('\b \b');
					}
				} else {
					password += c;
					output.write('*');
				}
			};

			ttyInput.on('data', onData);
		});
	}

	// Fallback for non-TTY (pipes, tests)
	return new Promise((resolve, reject) => {
		const rl = createInterface({ input, output, terminal: false });
		let resolved = false;

		rl.once('line', (line: string) => {
			resolved = true;
			rl.close();
			resolve(line.trim());
		});

		rl.once('close', () => {
			if (!resolved) {
				reject(new Error('No password provided.'));
			}
		});
	});
}
