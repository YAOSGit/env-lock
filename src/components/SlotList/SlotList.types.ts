import type { Slot } from '../../types/Slot/index.js';

export type SlotListProps = {
	slots: Slot[];
	unlockedSlotId: string | null;
	onAddSlot: (slotId: string, password: string) => void;
	onRemoveSlot: (slotId: string) => void;
	onReplaceSlot: (slotId: string, newPassword: string) => void;
};

export type Mode =
	| { type: 'browse' }
	| { type: 'adding-id'; value: string }
	| { type: 'adding-password'; slotId: string; value: string }
	| { type: 'editing-password'; slotId: string; value: string };
