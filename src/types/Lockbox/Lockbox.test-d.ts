import { assertType, describe, it } from 'vitest';
import type { Lockbox } from './index.js';

describe('Lockbox type', () => {
	it('accepts a valid lockbox', () => {
		assertType<Lockbox>({
			version: 1,
			slots: [
				{
					id: 'alice@team.com',
					kdf: 'argon2id',
					salt: 'base64salt==',
					iterations: 3,
					wrappedKey: 'base64key==',
					wrappingIv: 'base64iv==',
					wrappingTag: 'base64tag==',
					createdAt: '2026-01-01T00:00:00.000Z',
				},
			],
		});
	});

	it('accepts empty slots array', () => {
		assertType<Lockbox>({ version: 1, slots: [] });
	});
});
