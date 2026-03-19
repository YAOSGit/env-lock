import { Box, Text, useInput } from 'ink';
import type React from 'react';
import { useState } from 'react';
import { useUIStateContext } from '../../providers/UIStateProvider/index.js';
import { PROMPT_COLOR, SELECTED_COLOR } from './SlotList.consts.js';
import type { Mode, SlotListProps } from './SlotList.types.js';

export const SlotList: React.FC<SlotListProps> = ({
	slots,
	unlockedSlotId,
	onAddSlot,
	onRemoveSlot,
	onReplaceSlot,
}) => {
	const ui = useUIStateContext();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [mode, setMode] = useState<Mode>({ type: 'browse' });

	const enterInputMode = (next: Mode) => {
		ui.setInputActive(true);
		setMode(next);
	};

	const exitInputMode = () => {
		ui.setInputActive(false);
		setMode({ type: 'browse' });
	};

	useInput((input, key) => {
		if (ui.confirmation) return;

		if (mode.type === 'adding-id') {
			if (key.return) {
				const trimmed = mode.value.trim();
				if (trimmed) {
					// Stay in input mode — transitioning to adding-password, still capturing text
					setMode({ type: 'adding-password', slotId: trimmed, value: '' });
				}
			} else if (key.escape) {
				exitInputMode();
			} else if (key.backspace || key.delete) {
				setMode({ ...mode, value: mode.value.slice(0, -1) });
			} else if (input && !key.ctrl && !key.meta) {
				setMode({ ...mode, value: mode.value + input });
			}
			return;
		}

		if (mode.type === 'adding-password') {
			if (key.return) {
				if (mode.value) {
					onAddSlot(mode.slotId, mode.value);
				}
				exitInputMode();
			} else if (key.escape) {
				exitInputMode();
			} else if (key.backspace || key.delete) {
				setMode({ ...mode, value: mode.value.slice(0, -1) });
			} else if (input && !key.ctrl && !key.meta) {
				setMode({ ...mode, value: mode.value + input });
			}
			return;
		}

		if (mode.type === 'editing-password') {
			if (key.return) {
				if (mode.value) {
					onReplaceSlot(mode.slotId, mode.value);
				}
				exitInputMode();
			} else if (key.escape) {
				exitInputMode();
			} else if (key.backspace || key.delete) {
				setMode({ ...mode, value: mode.value.slice(0, -1) });
			} else if (input && !key.ctrl && !key.meta) {
				setMode({ ...mode, value: mode.value + input });
			}
			return;
		}

		// Browse mode
		if (key.upArrow) {
			setSelectedIndex((prev) => Math.max(0, prev - 1));
		} else if (key.downArrow) {
			setSelectedIndex((prev) => Math.min(slots.length - 1, prev + 1));
		} else if (input === 'n') {
			enterInputMode({ type: 'adding-id', value: '' });
		} else if (input === 'e' && slots.length > 0) {
			const selected = slots[selectedIndex];
			if (selected && selected.id === unlockedSlotId) {
				enterInputMode({ type: 'editing-password', slotId: selected.id, value: '' });
			}
		} else if (input === 'd' && slots.length > 0) {
			const slot = slots[selectedIndex];
			if (slot) {
				ui.requestConfirmation(`Remove slot "${slot.id}"?`, () => {
					onRemoveSlot(slot.id);
					setSelectedIndex((prev) =>
						Math.max(0, Math.min(prev, slots.length - 2)),
					);
				});
			}
		}
	});

	return (
		<Box flexDirection="column">
			{slots.length === 0 ? (
				<Text dimColor>No slots. Press 'a' to add a member.</Text>
			) : (
				slots.map((slot, index) => {
					const isSelected = index === selectedIndex;
					const date = new Date(slot.createdAt).toLocaleDateString();

					return (
						<Box key={slot.id}>
							<Text color={isSelected ? SELECTED_COLOR : undefined}>
								{isSelected ? '▸ ' : '  '}
							</Text>
							<Text bold>{slot.id}</Text>
							<Text dimColor>
								{' '}
								({slot.kdf}, {date})
							</Text>
						</Box>
					);
				})
			)}

			{mode.type === 'adding-id' ? (
				<Box marginTop={1}>
					<Text color={PROMPT_COLOR}>Slot ID (e.g. email): </Text>
					<Text>{mode.value}</Text>
					<Text dimColor>|</Text>
				</Box>
			) : null}

			{mode.type === 'adding-password' ? (
				<Box marginTop={1}>
					<Text color={PROMPT_COLOR}>Password for {mode.slotId}: </Text>
					<Text>{'*'.repeat(mode.value.length)}</Text>
					<Text dimColor>|</Text>
				</Box>
			) : null}

			{mode.type === 'editing-password' ? (
				<Box marginTop={1}>
					<Text color={PROMPT_COLOR}>New password for {mode.slotId}: </Text>
					<Text>{'*'.repeat(mode.value.length)}</Text>
					<Text dimColor>|</Text>
				</Box>
			) : null}
		</Box>
	);
};
