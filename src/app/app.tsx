import { Box, Text } from 'ink';
import { useApp } from 'ink';
import type React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { TUILayout } from '@yaos-git/toolkit/tui/components';
import { COMMANDS, CommandsProvider } from '../commands/index.js';
import type { EnvLockDeps } from '../commands/types.js';
import { PasswordPrompt } from '../components/PasswordPrompt/index.js';
import { SecretList } from '../components/SecretList/index.js';
import { SlotList } from '../components/SlotList/index.js';
import { createSlot } from '../crypto/slot/index.js';
import { useLockbox } from '../hooks/useLockbox/index.js';
import { useSecrets } from '../hooks/useSecrets/index.js';
import { useUIStateContext } from '../providers/UIStateProvider/index.js';
import { theme } from '../theme.js';

const HELP_SECTION_COLORS: Record<string, string> = {
	Navigation: theme.info,
	Actions: theme.success,
	General: 'white',
};

export const AppContent: React.FC = () => {
	const { exit } = useApp();
	const ui = useUIStateContext();
	const { lockbox, addSlot, removeSlot, replaceSlot } = useLockbox();
	const {
		secrets,
		isDirty,
		isUnlocked,
		masterKey,
		unlockedSlotId,
		unlock,
		setSecret,
		addSecret,
		deleteSecret,
		save,
	} = useSecrets();

	// Auto-unlock from env var on mount
	useEffect(() => {
		if (isUnlocked) return;
		const envPassword = process.env.ENV_LOCK_PASSWORD;
		if (envPassword) {
			unlock(envPassword);
		}
	}, [isUnlocked, unlock]);

	const onQuit = useCallback(() => exit(), [exit]);

	const deps: EnvLockDeps = useMemo(
		() => ({ ui, onQuit, isDirty, save }),
		[ui, onQuit, isDirty, save],
	);

	const handleAddSlot = useCallback(
		(slotId: string, password: string) => {
			if (!masterKey) return;
			addSlot(createSlot(masterKey, password, slotId));
		},
		[masterKey, addSlot],
	);

	const handleReplaceSlot = useCallback(
		(slotId: string, newPassword: string) => {
			if (!masterKey) return;
			replaceSlot(slotId, createSlot(masterKey, newPassword, slotId));
		},
		[masterKey, replaceSlot],
	);

	const header = isUnlocked ? (
		<Box width="100%" borderStyle="round" borderColor="gray" paddingX={1} justifyContent="space-between">
			<Text wrap="truncate">
				<Text bold color={theme.brand}>env-lock</Text>
				{isDirty ? <Text color={theme.warning}> (unsaved)</Text> : null}
			</Text>
			<Box gap={2}>
				<Text
					color={ui.activeTab === 'secrets' ? theme.brand : undefined}
					bold={ui.activeTab === 'secrets'}
				>
					{ui.activeTab === 'secrets' ? '\u25cf' : '\u25cb'} Secrets
				</Text>
				<Text
					color={ui.activeTab === 'slots' ? theme.brand : undefined}
					bold={ui.activeTab === 'slots'}
				>
					{ui.activeTab === 'slots' ? '\u25cf' : '\u25cb'} Slots
				</Text>
			</Box>
		</Box>
	) : null;

	if (!lockbox) {
		return (
			<Box padding={1}>
				<Text color={theme.error}>No env-lock.json found. Run "env-lock init" first.</Text>
			</Box>
		);
	}

	if (!isUnlocked) {
		return (
			<PasswordPrompt
				onSubmit={(password) => {
					unlock(password);
				}}
			/>
		);
	}

	const content =
		ui.activeTab === 'secrets' ? (
			<SecretList
				secrets={secrets}
				isDirty={isDirty}
				onEdit={setSecret}
				onAdd={addSecret}
				onDelete={deleteSecret}
				onSave={save}
			/>
		) : (
			<SlotList
				slots={lockbox.slots}
				unlockedSlotId={unlockedSlotId}
				onAddSlot={handleAddSlot}
				onRemoveSlot={removeSlot}
				onReplaceSlot={handleReplaceSlot}
			/>
		);

	return (
		<CommandsProvider deps={deps}>
			<TUILayout
				brand="env-lock"
				theme={theme}
				commands={COMMANDS}
				deps={deps}
				helpTitle="env-lock — Keyboard Shortcuts"
				helpSectionColors={HELP_SECTION_COLORS}
				header={header}
			>
				{content}
			</TUILayout>
		</CommandsProvider>
	);
};
