import type { BaseDeps, Command } from '@yaos-git/toolkit/types';
import type { UseUIStateReturn } from '../hooks/useUIState/index.js';

export type EnvLockDeps = BaseDeps & {
	ui: UseUIStateReturn;
	isDirty: boolean;
	save: () => void;
};

export type EnvLockCommand = Command<EnvLockDeps>;
