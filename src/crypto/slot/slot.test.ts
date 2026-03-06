import { describe, expect, it } from 'vitest';
import { generateMasterKey } from '../masterKey/index.js';
import { createSlot, unwrapSlot } from './index.js';

describe('Slot wrap/unwrap', () => {
	const mk = generateMasterKey();
	const password = 'test-password-123';

	it('creates a slot and unwraps the master key', () => {
		const slot = createSlot(mk, password, 'alice@team.com');

		expect(slot.id).toBe('alice@team.com');
		expect(slot.kdf).toBe('pbkdf2');
		expect(slot.salt).toBeTruthy();
		expect(slot.wrappedKey).toBeTruthy();
		expect(slot.wrappingIv).toBeTruthy();
		expect(slot.wrappingTag).toBeTruthy();
		expect(slot.createdAt).toBeTruthy();

		const unwrapped = unwrapSlot(slot, password);
		expect(unwrapped.equals(mk)).toBe(true);
	});

	it('fails to unwrap with wrong password', () => {
		const slot = createSlot(mk, password, 'bob@team.com');
		expect(() => unwrapSlot(slot, 'wrong-password')).toThrow();
	});

	it('different slots for same MK produce different wrapped keys', () => {
		const s1 = createSlot(mk, 'pass-a', 'user-a');
		const s2 = createSlot(mk, 'pass-b', 'user-b');
		expect(s1.wrappedKey).not.toBe(s2.wrappedKey);
	});
});
