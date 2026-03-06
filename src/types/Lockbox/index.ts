import type { Slot } from '../Slot/index.js';

export type Lockbox = {
	/** Schema version for forward compatibility */
	version: number;
	/** Array of user slots, each containing a wrapped copy of the Master Key */
	slots: Slot[];
};
