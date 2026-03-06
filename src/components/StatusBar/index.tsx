import { Box, Text } from 'ink';
import type React from 'react';
import type { StatusBarProps } from './StatusBar.types.js';

export const StatusBar: React.FC<StatusBarProps> = ({ children }) => {
	return (
		<Box borderStyle="single" paddingX={1} marginTop={1}>
			<Text>{children}</Text>
		</Box>
	);
};
