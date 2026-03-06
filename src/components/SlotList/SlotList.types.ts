import type { Slot } from '../../types/Slot/index.js';

export type SlotListProps = {
	slots: Slot[];
	onAddSlot: (slotId: string, password: string) => void;
	onRemoveSlot: (slotId: string) => void;
};

export type Mode =
	| { type: 'browse' }
	| { type: 'adding-id'; value: string }
	| { type: 'adding-password'; slotId: string; value: string }
	| { type: 'confirm-delete'; slotId: string };
