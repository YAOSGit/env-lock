import type { Slot } from '../../types/Slot/index.js';
import { aesDecrypt, aesEncrypt } from '../aes/index.js';
import { deriveKey, generateSalt } from '../kdf/index.js';

const DEFAULT_ITERATIONS = 600_000;

export function createSlot(
	masterKey: Buffer,
	password: string,
	slotId: string,
): Slot {
	const salt = generateSalt();
	const wrappingKey = deriveKey(password, salt, {
		algorithm: 'pbkdf2',
		iterations: DEFAULT_ITERATIONS,
	});

	const envelope = aesEncrypt(masterKey.toString('base64'), wrappingKey);

	return {
		id: slotId,
		kdf: 'pbkdf2',
		salt,
		iterations: DEFAULT_ITERATIONS,
		wrappedKey: envelope.ciphertext,
		wrappingIv: envelope.iv,
		wrappingTag: envelope.tag,
		createdAt: new Date().toISOString(),
	};
}

export function unwrapSlot(slot: Slot, password: string): Buffer {
	const wrappingKey = deriveKey(password, slot.salt, {
		algorithm: slot.kdf,
		iterations: slot.iterations,
	});

	const mkBase64 = aesDecrypt(
		{
			ciphertext: slot.wrappedKey,
			iv: slot.wrappingIv,
			tag: slot.wrappingTag,
		},
		wrappingKey,
	);

	return Buffer.from(mkBase64, 'base64');
}
