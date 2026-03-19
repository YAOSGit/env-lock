import { Box, Text, useInput } from 'ink';
import type React from 'react';
import { useState } from 'react';
import { ERROR_COLOR } from './PasswordPrompt.consts.js';
import type { PasswordPromptProps } from './PasswordPrompt.types.js';

export const PasswordPrompt: React.FC<PasswordPromptProps> = ({
	onSubmit,
	error,
}) => {
	const [password, setPassword] = useState('');

	useInput((input, key) => {
		if (key.return) {
			onSubmit(password);
			return;
		}

		if (key.backspace || key.delete) {
			setPassword((prev) => prev.slice(0, -1));
			return;
		}

		if (input && !key.ctrl && !key.meta) {
			setPassword((prev) => prev + input);
		}
	});

	return (
		<Box flexDirection="column" padding={1}>
			<Box marginBottom={1}>
				<Text bold>env-lock</Text>
				<Text dimColor> — Unlock your secrets</Text>
			</Box>

			<Box>
				<Text>Password: </Text>
				<Text>{'*'.repeat(password.length)}</Text>
				<Text dimColor>|</Text>
			</Box>

			{error ? (
				<Box marginTop={1}>
					<Text color={ERROR_COLOR}>{error}</Text>
				</Box>
			) : null}
		</Box>
	);
};
