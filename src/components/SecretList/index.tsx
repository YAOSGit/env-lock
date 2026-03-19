import { Box, Text, useInput } from 'ink';
import type React from 'react';
import { useState } from 'react';
import { useUIStateContext } from '../../providers/UIStateProvider/index.js';
import { INPUT_COLOR, SELECTED_COLOR, UNSAVED_CHANGES_COLOR } from './SecretList.consts.js';
import type { Mode, SecretListProps } from './SecretList.types.js';

export const SecretList: React.FC<SecretListProps> = ({
	secrets,
	isDirty,
	onEdit,
	onAdd,
	onDelete,
	onSave,
}) => {
	const ui = useUIStateContext();
	const keys = Object.keys(secrets);
	const [cursor, setCursor] = useState(0);
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

		if (mode.type === 'browse') {
			if (key.downArrow) {
				setCursor((prev) => Math.min(prev + 1, keys.length - 1));
				return;
			}
			if (key.upArrow) {
				setCursor((prev) => Math.max(prev - 1, 0));
				return;
			}
			if ((input === 'e' || key.return) && keys.length > 0) {
				const k = keys[cursor];
				if (k !== undefined) {
					enterInputMode({ type: 'editing', key: k, value: secrets[k] ?? '' });
				}
				return;
			}
			if (input === 'n') {
				enterInputMode({ type: 'adding-key', value: '' });
				return;
			}
			if (input === 'd' && keys.length > 0) {
				const k = keys[cursor];
				if (k !== undefined) {
					ui.requestConfirmation(`Delete "${k}"?`, () => {
						onDelete(k);
					});
				}
				return;
			}
			return;
		}

		if (mode.type === 'editing') {
			if (key.return) {
				onEdit(mode.key, mode.value);
				exitInputMode();
				return;
			}
			if (key.escape) {
				exitInputMode();
				return;
			}
			if (key.backspace || key.delete) {
				setMode({ ...mode, value: mode.value.slice(0, -1) });
				return;
			}
			if (input && !key.ctrl && !key.meta) {
				setMode({ ...mode, value: mode.value + input });
			}
			return;
		}

		if (mode.type === 'adding-key') {
			if (key.return) {
				if (mode.value.length > 0) {
					// Stay in input mode — transitioning to adding-value, still capturing text
					setMode({ type: 'adding-value', key: mode.value, value: '' });
				}
				return;
			}
			if (key.escape) {
				exitInputMode();
				return;
			}
			if (key.backspace || key.delete) {
				setMode({ ...mode, value: mode.value.slice(0, -1) });
				return;
			}
			if (input && !key.ctrl && !key.meta) {
				setMode({ ...mode, value: mode.value + input });
			}
			return;
		}

		if (mode.type === 'adding-value') {
			if (key.return) {
				onAdd(mode.key, mode.value);
				exitInputMode();
				return;
			}
			if (key.escape) {
				exitInputMode();
				return;
			}
			if (key.backspace || key.delete) {
				setMode({ ...mode, value: mode.value.slice(0, -1) });
				return;
			}
			if (input && !key.ctrl && !key.meta) {
				setMode({ ...mode, value: mode.value + input });
			}
			return;
		}
	});

	if (keys.length === 0 && mode.type === 'browse') {
		return (
			<Box flexDirection="column">
				<Text dimColor>No secrets. Press 'a' to add one.</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			{keys.map((k, i) => {
				const isSelected = i === cursor;
				const isEditing =
					mode.type === 'editing' && mode.key === k && isSelected;

				if (isEditing && mode.type === 'editing') {
					return (
						<Text key={k} color={SELECTED_COLOR}>
							{'▸ '}
							<Text bold>{k}</Text>
							{' = '}
							<Text color={INPUT_COLOR}>
								{mode.value}
								{'|'}
							</Text>
						</Text>
					);
				}

				if (isSelected) {
					return (
						<Text key={k} color={SELECTED_COLOR}>
							{'▸ '}
							<Text bold>{k}</Text>
							{' = '}
							<Text dimColor>{secrets[k]}</Text>
						</Text>
					);
				}

				return (
					<Text key={k}>
						{'  '}
						<Text bold>{k}</Text>
						{' = '}
						<Text dimColor>{secrets[k]}</Text>
					</Text>
				);
			})}

			{mode.type === 'adding-key' ? (
				<Box marginTop={1}>
					<Text>
						Key: <Text color={INPUT_COLOR}>{mode.value}|</Text>
					</Text>
				</Box>
			) : null}

			{mode.type === 'adding-value' ? (
				<Box marginTop={1}>
					<Text>
						{mode.key} = <Text color={INPUT_COLOR}>{mode.value}|</Text>
					</Text>
				</Box>
			) : null}

			{isDirty && mode.type === 'browse' ? (
				<Box marginTop={1}>
					<Text color={UNSAVED_CHANGES_COLOR}>Unsaved changes. Press 's' to save.</Text>
				</Box>
			) : null}
		</Box>
	);
};
