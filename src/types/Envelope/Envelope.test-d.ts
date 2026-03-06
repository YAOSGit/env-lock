import { assertType, describe, it } from 'vitest';
import type { Envelope } from './index.js';

describe('Envelope type', () => {
	it('accepts a valid envelope', () => {
		assertType<Envelope>({
			ciphertext: 'base64data==',
			iv: 'base64iv==',
			tag: 'base64tag==',
		});
	});
});
