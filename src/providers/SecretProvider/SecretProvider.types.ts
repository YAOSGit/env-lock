import type React from 'react';
import type { EnvMap } from '../../types/EnvSchema/index.js';

export type SecretContextValue = {
	secrets: EnvMap;
	isDirty: boolean;
	isUnlocked: boolean;
	masterKey: Buffer | null;
	unlockedSlotId: string | null;
	unlock: (password: string) => boolean;
	setSecret: (key: string, value: string) => void;
	addSecret: (key: string, value: string) => void;
	deleteSecret: (key: string) => void;
	save: () => void;
};

export type SecretProviderProps = {
	children: React.ReactNode;
};
