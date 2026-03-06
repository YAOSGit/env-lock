import { Box, Text, useInput } from 'ink';
import type React from 'react';
import { useState } from 'react';
import type { Mode, SecretListProps } from './SecretList.types.js';

export const SecretList: React.FC<SecretListProps> = ({
	secrets,
	isDirty,
	onEdit,
	onAdd,
	onDelete,
	onSave,
}) => {
	const keys = Object.keys(secrets);
	const [cursor, setCursor] = useState(0);
	const [mode, setMode] = useState<Mode>({ type: 'browse' });

	useInput((input, key) => {
		if (mode.type === 'browse') {
			if (key.downArrow) {
				setCursor((prev) => Math.min(prev + 1, keys.length - 1));
				return;
			}
			if (key.upArrow) {
				setCursor((prev) => Math.max(prev - 1, 0));
				return;
			}
			if (input === 'e' && keys.length > 0) {
				const k = keys[cursor];
				if (k !== undefined) {
					setMode({ type: 'editing', key: k, value: secrets[k] ?? '' });
				}
				return;
			}
			if (input === 'a') {
				setMode({ type: 'adding-key', value: '' });
				return;
			}
			if (input === 'd' && keys.length > 0) {
				const k = keys[cursor];
				if (k !== undefined) {
					setMode({ type: 'confirm-delete', key: k });
				}
				return;
			}
			if (input === 's') {
				onSave();
				return;
			}
			return;
		}

		if (mode.type === 'editing') {
			if (key.return) {
				onEdit(mode.key, mode.value);
				setMode({ type: 'browse' });
				return;
			}
			if (key.escape) {
				setMode({ type: 'browse' });
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
					setMode({ type: 'adding-value', key: mode.value, value: '' });
				}
				return;
			}
			if (key.escape) {
				setMode({ type: 'browse' });
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
				setMode({ type: 'browse' });
				return;
			}
			if (key.escape) {
				setMode({ type: 'browse' });
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

		if (mode.type === 'confirm-delete') {
			if (input === 'y' || input === 'Y') {
				onDelete(mode.key);
				setMode({ type: 'browse' });
				return;
			}
			if (input === 'n' || input === 'N' || key.escape) {
				setMode({ type: 'browse' });
				return;
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
						<Text key={k} color="cyan">
							{'> '}
							<Text bold>{k}</Text>
							{' = '}
							<Text color="green">
								{mode.value}
								{'|'}
							</Text>
						</Text>
					);
				}

				if (isSelected) {
					return (
						<Text key={k} color="cyan">
							{'> '}
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

			{mode.type === 'confirm-delete' ? (
				<Box marginTop={1}>
					<Text color="yellow">
						Delete {mode.key}? <Text dimColor>(y/N)</Text>
					</Text>
				</Box>
			) : null}

			{mode.type === 'adding-key' ? (
				<Box marginTop={1}>
					<Text>
						Key: <Text color="green">{mode.value}|</Text>
					</Text>
				</Box>
			) : null}

			{mode.type === 'adding-value' ? (
				<Box marginTop={1}>
					<Text>
						{mode.key} = <Text color="green">{mode.value}|</Text>
					</Text>
				</Box>
			) : null}

			{isDirty && mode.type === 'browse' ? (
				<Box marginTop={1}>
					<Text color="yellow">Unsaved changes. Press 's' to save.</Text>
				</Box>
			) : null}
		</Box>
	);
};
