import { randomBytes } from 'node:crypto';

const MK_LENGTH = 32;

export function generateMasterKey(): Buffer {
	return randomBytes(MK_LENGTH);
}
