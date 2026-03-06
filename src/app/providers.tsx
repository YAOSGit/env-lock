import type React from 'react';
import { LockboxProvider } from '../providers/LockboxProvider/index.js';
import { SecretProvider } from '../providers/SecretProvider/index.js';

export type AppProvidersProps = {
	children: React.ReactNode;
};

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
	return (
		<LockboxProvider>
			<SecretProvider>{children}</SecretProvider>
		</LockboxProvider>
	);
};
