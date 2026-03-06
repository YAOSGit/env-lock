import { assertType, describe, it } from 'vitest';
import type { KdfAlgorithm, Slot } from './index.js';

describe('Slot type', () => {
	it('accepts a valid slot', () => {
		assertType<Slot>({
			id: 'alice@team.com',
			kdf: 'argon2id',
			salt: 'base64salt==',
			iterations: 3,
			wrappedKey: 'base64key==',
			wrappingIv: 'base64iv==',
			wrappingTag: 'base64tag==',
			createdAt: '2026-01-01T00:00:00.000Z',
		});
	});

	it('restricts kdf to known algorithms', () => {
		assertType<KdfAlgorithm>('argon2id');
		assertType<KdfAlgorithm>('pbkdf2');
	});
});
