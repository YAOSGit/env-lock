import type React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import type { Slot } from '../../types/Slot/index.js';
import { loadLockbox, saveLockbox } from '../../utils/lockbox/index.js';
import type {
	LockboxContextValue,
	LockboxProviderProps,
} from './LockboxProvider.types.js';

const LockboxContext = createContext<LockboxContextValue | null>(null);

export const LockboxProvider: React.FC<LockboxProviderProps> = ({
	children,
}) => {
	const [lockbox, setLockbox] = useState(() => loadLockbox());

	const reload = useCallback(() => {
		setLockbox(loadLockbox());
	}, []);

	const addSlot = useCallback((slot: Slot) => {
		setLockbox((prev) => {
			if (!prev) return prev;
			const updated = { ...prev, slots: [...prev.slots, slot] };
			saveLockbox(updated);
			return updated;
		});
	}, []);

	const removeSlot = useCallback((slotId: string) => {
		setLockbox((prev) => {
			if (!prev) return prev;
			const updated = {
				...prev,
				slots: prev.slots.filter((s) => s.id !== slotId),
			};
			saveLockbox(updated);
			return updated;
		});
	}, []);

	const replaceSlot = useCallback((slotId: string, newSlot: Slot) => {
		setLockbox((prev) => {
			if (!prev) return prev;
			const updated = {
				...prev,
				slots: prev.slots.map((s) => (s.id === slotId ? newSlot : s)),
			};
			saveLockbox(updated);
			return updated;
		});
	}, []);

	return (
		<LockboxContext.Provider
			value={{ lockbox, reload, addSlot, removeSlot, replaceSlot }}
		>
			{children}
		</LockboxContext.Provider>
	);
};

export const useLockbox = (): LockboxContextValue => {
	const context = useContext(LockboxContext);
	if (!context) {
		throw new Error('useLockbox must be used within a LockboxProvider');
	}
	return context;
};
