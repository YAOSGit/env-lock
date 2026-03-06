import type React from 'react';
import type { Lockbox } from '../../types/Lockbox/index.js';
import type { Slot } from '../../types/Slot/index.js';

export type LockboxContextValue = {
	lockbox: Lockbox | null;
	reload: () => void;
	addSlot: (slot: Slot) => void;
	removeSlot: (slotId: string) => void;
};

export type LockboxProviderProps = {
	children: React.ReactNode;
};
