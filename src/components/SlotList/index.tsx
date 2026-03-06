import { Box, Text, useInput } from 'ink';
import type React from 'react';
import { useState } from 'react';
import type { Mode, SlotListProps } from './SlotList.types.js';

export const SlotList: React.FC<SlotListProps> = ({
	slots,
	unlockedSlotId,
	onAddSlot,
	onRemoveSlot,
	onReplaceSlot,
}) => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [mode, setMode] = useState<Mode>({ type: 'browse' });

	useInput((input, key) => {
		if (mode.type === 'confirm-delete') {
			if (input === 'y' || input === 'Y') {
				onRemoveSlot(mode.slotId);
				setSelectedIndex((prev) =>
					Math.max(0, Math.min(prev, slots.length - 2)),
				);
			}
			setMode({ type: 'browse' });
			return;
		}

		if (mode.type === 'adding-id') {
			if (key.return) {
				const trimmed = mode.value.trim();
				if (trimmed) {
					setMode({ type: 'adding-password', slotId: trimmed, value: '' });
				}
			} else if (key.escape) {
				setMode({ type: 'browse' });
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
				setMode({ type: 'browse' });
			} else if (key.escape) {
				setMode({ type: 'browse' });
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
				setMode({ type: 'browse' });
			} else if (key.escape) {
				setMode({ type: 'browse' });
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
		} else if (input === 'a') {
			setMode({ type: 'adding-id', value: '' });
		} else if (input === 'e' && slots.length > 0) {
			const selected = slots[selectedIndex];
			if (selected && selected.id === unlockedSlotId) {
				setMode({ type: 'editing-password', slotId: selected.id, value: '' });
			}
		} else if (input === 'd' && slots.length > 0) {
			setMode({ type: 'confirm-delete', slotId: slots[selectedIndex].id });
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
							<Text color={isSelected ? 'cyan' : undefined}>
								{isSelected ? '> ' : '  '}
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
					<Text color="green">Slot ID (e.g. email): </Text>
					<Text>{mode.value}</Text>
					<Text dimColor>|</Text>
				</Box>
			) : null}

			{mode.type === 'adding-password' ? (
				<Box marginTop={1}>
					<Text color="green">Password for {mode.slotId}: </Text>
					<Text>{'*'.repeat(mode.value.length)}</Text>
					<Text dimColor>|</Text>
				</Box>
			) : null}

			{mode.type === 'editing-password' ? (
				<Box marginTop={1}>
					<Text color="green">New password for {mode.slotId}: </Text>
					<Text>{'*'.repeat(mode.value.length)}</Text>
					<Text dimColor>|</Text>
				</Box>
			) : null}

			{mode.type === 'confirm-delete' ? (
				<Box marginTop={1}>
					<Text color="yellow">Remove slot "{mode.slotId}"? (y/N)</Text>
				</Box>
			) : null}
		</Box>
	);
};
