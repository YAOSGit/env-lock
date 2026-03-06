import { describe, expect, it } from 'vitest';
import { generateMasterKey } from './index.js';

describe('Master Key', () => {
	it('generates a 32-byte random key', () => {
		const mk = generateMasterKey();
		expect(mk).toHaveLength(32);
	});

	it('generates unique keys each time', () => {
		const mk1 = generateMasterKey();
		const mk2 = generateMasterKey();
		expect(mk1.equals(mk2)).toBe(false);
	});
});
