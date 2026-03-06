import { Box, Text, useInput } from 'ink';
import type React from 'react';
import type { ConfirmDialogProps } from './ConfirmDialog.types.js';

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	message,
	onConfirm,
	onCancel,
}) => {
	useInput((input, key) => {
		if (input === 'y' || input === 'Y') {
			onConfirm();
		} else if (input === 'n' || input === 'N' || key.escape) {
			onCancel();
		}
	});

	return (
		<Box marginTop={1}>
			<Text color="yellow">{message}</Text>
			<Text dimColor> (y/N)</Text>
		</Box>
	);
};
