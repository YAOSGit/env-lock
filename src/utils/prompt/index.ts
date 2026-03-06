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

	return new Promise((resolve) => {
		const rl = createInterface({ input, output, terminal: false });

		output.write(message);

		rl.once('line', (line) => {
			rl.close();
			resolve(line.trim());
		});
	});
}
