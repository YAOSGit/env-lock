import { useCallback, useMemo, useState } from 'react';
import type { OverlayState, PendingConfirmation } from '@yaos-git/toolkit/types';

export type EnvLockOverlay = 'help';
type Tab = 'secrets' | 'slots';

type UIState = {
	overlay: EnvLockOverlay | 'none';
	confirmation: PendingConfirmation | null;
	inputActive: boolean;
	activeTab: Tab;
};

export type UseUIStateReturn = OverlayState & {
	cycleFocus: () => void;
	/** True while a component is capturing raw text input (e.g. editing a secret). */
	inputActive: boolean;
	setInputActive: (active: boolean) => void;
	activeTab: Tab;
	setActiveTab: (tab: Tab) => void;
};

export function useUIState(): UseUIStateReturn {
	const [state, setState] = useState<UIState>({
		overlay: 'none',
		confirmation: null,
		inputActive: false,
		activeTab: 'secrets',
	});

	const setActiveOverlay = useCallback((overlay: string) => {
		setState((s) => ({ ...s, overlay: overlay as EnvLockOverlay | 'none' }));
	}, []);

	const requestConfirmation = useCallback((message: string, onConfirm: () => void) => {
		setState((s) => ({ ...s, confirmation: { message, onConfirm } }));
	}, []);

	const clearConfirmation = useCallback(() => {
		setState((s) => ({ ...s, confirmation: null }));
	}, []);

	const cycleFocus = useCallback(() => {}, []);

	const setInputActive = useCallback((active: boolean) => {
		setState((s) => ({ ...s, inputActive: active }));
	}, []);

	const setActiveTab = useCallback((tab: Tab) => {
		setState((s) => ({ ...s, activeTab: tab }));
	}, []);

	return useMemo(
		() => ({
			activeOverlay: state.overlay,
			setActiveOverlay,
			confirmation: state.confirmation,
			requestConfirmation,
			clearConfirmation,
			cycleFocus,
			inputActive: state.inputActive,
			setInputActive,
			activeTab: state.activeTab,
			setActiveTab,
		}),
		[state, setActiveOverlay, requestConfirmation, clearConfirmation, cycleFocus, setInputActive, setActiveTab],
	);
}
