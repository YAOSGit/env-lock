import { Box, Text, useApp, useInput } from 'ink';
import type React from 'react';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog/index.js';
import { PasswordPrompt } from '../components/PasswordPrompt/index.js';
import { SecretList } from '../components/SecretList/index.js';
import { SlotList } from '../components/SlotList/index.js';
import { StatusBar } from '../components/StatusBar/index.js';
import { createSlot } from '../crypto/slot/index.js';
import { useLockbox } from '../hooks/useLockbox/index.js';
import { useSecrets } from '../hooks/useSecrets/index.js';

import type { Tab } from './app.types.js';

export const AppContent: React.FC = () => {
	const { exit } = useApp();
	const { lockbox, addSlot, removeSlot } = useLockbox();
	const {
		secrets,
		isDirty,
		isUnlocked,
		masterKey,
		unlock,
		setSecret,
		addSecret,
		deleteSecret,
		save,
	} = useSecrets();

	const [activeTab, setActiveTab] = useState<Tab>('secrets');
	const [authError, setAuthError] = useState<string | undefined>();
	const [quitConfirm, setQuitConfirm] = useState(false);

	// Auto-unlock from env var on mount
	useEffect(() => {
		if (isUnlocked) return;
		const envPassword = process.env.ENV_LOCK_PASSWORD;
		if (envPassword) {
			const success = unlock(envPassword);
			if (!success) {
				setAuthError('ENV_LOCK_PASSWORD did not match any slot.');
			}
		}
	}, [isUnlocked, unlock]);

	const secretCount = lockbox ? Object.keys(secrets).length : 0;
	const slotCount = lockbox ? lockbox.slots.length : 0;

	const handleAddSlot = (slotId: string, password: string) => {
		if (!masterKey) return;
		const slot = createSlot(masterKey, password, slotId);
		addSlot(slot);
	};

	// Tab switching and quit handling — must be called unconditionally
	useInput((input, key) => {
		if (!isUnlocked || !lockbox || quitConfirm) return;

		if (key.leftArrow) {
			setActiveTab('secrets');
		} else if (key.rightArrow) {
			setActiveTab('slots');
		} else if (input === 'q') {
			if (isDirty) {
				setQuitConfirm(true);
			} else {
				exit();
			}
		}
	});

	if (!lockbox) {
		return (
			<Box padding={1}>
				<Text color="red">
					No env-lock.json found. Run "env-lock init" first.
				</Text>
			</Box>
		);
	}

	if (!isUnlocked) {
		return (
			<PasswordPrompt
				error={authError}
				onSubmit={(password) => {
					const success = unlock(password);
					if (!success) {
						setAuthError('Invalid password. Try again.');
					} else {
						setAuthError(undefined);
					}
				}}
			/>
		);
	}

	if (quitConfirm) {
		return (
			<Box flexDirection="column" padding={1}>
				<ConfirmDialog
					message="Unsaved changes. Quit anyway?"
					onConfirm={() => exit()}
					onCancel={() => setQuitConfirm(false)}
				/>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" padding={1}>
			{/* Tab bar */}
			<Box marginBottom={1}>
				<Text
					bold={activeTab === 'secrets'}
					color={activeTab === 'secrets' ? 'cyan' : undefined}
					dimColor={activeTab !== 'secrets'}
				>
					[Secrets]
				</Text>
				<Text> </Text>
				<Text
					bold={activeTab === 'slots'}
					color={activeTab === 'slots' ? 'cyan' : undefined}
					dimColor={activeTab !== 'slots'}
				>
					[Slots]
				</Text>
			</Box>

			{/* Active tab content */}
			{activeTab === 'secrets' ? (
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
					onAddSlot={handleAddSlot}
					onRemoveSlot={removeSlot}
				/>
			)}

			{/* Status bar */}
			<StatusBar>
				<Text bold>env-lock</Text>
				<Text dimColor> | </Text>
				<Text>
					{secretCount} secret{secretCount !== 1 ? 's' : ''}
				</Text>
				<Text dimColor> | </Text>
				<Text>
					{slotCount} slot{slotCount !== 1 ? 's' : ''}
				</Text>
				{isDirty ? (
					<>
						<Text dimColor> | </Text>
						<Text color="yellow">unsaved</Text>
					</>
				) : null}
				<Text dimColor> | </Text>
				<Text bold>{'<>'}</Text>
				<Text> tabs</Text>
				<Text dimColor> | </Text>
				<Text bold>q</Text>
				<Text> quit</Text>
			</StatusBar>
		</Box>
	);
};
