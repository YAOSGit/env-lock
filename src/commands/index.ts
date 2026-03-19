import { createCommandsProvider } from '@yaos-git/toolkit/tui/commands';
import type { EnvLockCommand, EnvLockDeps } from './types.js';

const notInputting = (deps: EnvLockDeps) =>
	deps.ui.activeOverlay === 'none' && !deps.ui.inputActive;

const PROJECT_COMMANDS: EnvLockCommand[] = [
	// Override toolkit quit: prompt when there are unsaved changes
	{
		id: 'QUIT',
		keys: [{ textKey: 'q' }],
		displayKey: 'q',
		displayText: 'quit',
		helpSection: 'General',
		helpLabel: 'Exit env-lock editor',
		footer: 'priority',
		footerOrder: 99,
		isEnabled: notInputting,
		execute: (deps) => deps.onQuit(),
		needsConfirmation: (deps) => deps.isDirty,
		confirmMessage: 'Unsaved changes. Quit anyway?',
	},
	// Override toolkit help: guard against inputActive
	{
		id: 'HELP',
		keys: [{ textKey: 'h' }],
		displayKey: 'h',
		displayText: 'help',
		helpSection: 'General',
		footer: 'priority',
		footerOrder: 98,
		isEnabled: (deps) => notInputting(deps),
		execute: (deps) => deps.ui.setActiveOverlay('help'),
	},
	// Tab navigation — cycles between panels like run-tui split pane
	{
		id: 'CYCLE_TAB',
		keys: [{ specialKey: 'tab' }],
		displayKey: 'Tab',
		displayText: 'switch panel',
		helpSection: 'Navigation',
		helpLabel: 'Toggle between Secrets and Slots panels',
		footer: 'priority',
		footerOrder: 3,
		isEnabled: notInputting,
		execute: (deps) =>
			deps.ui.setActiveTab(deps.ui.activeTab === 'secrets' ? 'slots' : 'secrets'),
	},
	// Save
	{
		id: 'SAVE',
		keys: [{ textKey: 's' }],
		displayKey: 's',
		displayText: 'save',
		helpSection: 'Actions',
		helpLabel: 'Save changes to disk',
		footer: 'priority',
		footerOrder: 0,
		isEnabled: (deps) => notInputting(deps) && deps.isDirty,
		execute: (deps) => deps.save(),
	},

	// ── Navigation (display-only, both tabs) ─────────────────────────
	{
		id: 'NAV_UP',
		keys: [{ specialKey: 'up' }],
		displayKey: '↑ / ↓',
		displayText: 'move',
		helpSection: 'Navigation',
		footer: 'priority',
		footerOrder: 1,
		isEnabled: (deps) => notInputting(deps),
		execute: () => {},
	},
	{
		id: 'NAV_DOWN',
		keys: [{ specialKey: 'down' }],
		displayKey: '↓',
		displayText: 'down',
		helpSection: 'Navigation',
		footer: 'hidden',
		isEnabled: (deps) => notInputting(deps),
		execute: () => {},
	},
	{
		id: 'SELECT',
		keys: [{ specialKey: 'return' }],
		displayKey: 'Enter',
		displayText: 'edit',
		helpSection: 'Navigation',
		footer: 'priority',
		footerOrder: 2,
		isEnabled: (deps) => notInputting(deps),
		execute: () => {},
	},

	// ── Secrets tab ──────────────────────────────────────────────────
	{
		id: 'ADD_SECRET',
		keys: [{ textKey: 'n' }],
		displayKey: 'n',
		displayText: 'new',
		helpSection: 'Actions',
		helpLabel: 'Add a new secret',
		footer: 'optional',
		isEnabled: (deps) => notInputting(deps) && deps.ui.activeTab === 'secrets',
		execute: () => {},
	},
	{
		id: 'DELETE_SECRET',
		keys: [{ textKey: 'd' }],
		displayKey: 'd',
		displayText: 'delete',
		helpSection: 'Actions',
		helpLabel: 'Delete selected secret',
		footer: 'optional',
		isEnabled: (deps) => notInputting(deps) && deps.ui.activeTab === 'secrets',
		execute: () => {},
	},
	{
		id: 'EDIT_SECRET',
		keys: [{ textKey: 'e' }],
		displayKey: 'e',
		displayText: 'edit',
		helpSection: 'Actions',
		helpLabel: 'Edit selected secret value',
		footer: 'hidden',
		isEnabled: (deps) => notInputting(deps) && deps.ui.activeTab === 'secrets',
		execute: () => {},
	},

	// ── Slots tab ────────────────────────────────────────────────────
	{
		id: 'ADD_SLOT',
		keys: [{ textKey: 'n' }],
		displayKey: 'n',
		displayText: 'new',
		helpSection: 'Actions',
		helpLabel: 'Add a new slot',
		footer: 'optional',
		isEnabled: (deps) => notInputting(deps) && deps.ui.activeTab === 'slots',
		execute: () => {},
	},
	{
		id: 'DELETE_SLOT',
		keys: [{ textKey: 'd' }],
		displayKey: 'd',
		displayText: 'delete',
		helpSection: 'Actions',
		helpLabel: 'Delete selected slot',
		footer: 'optional',
		isEnabled: (deps) => notInputting(deps) && deps.ui.activeTab === 'slots',
		execute: () => {},
	},
	{
		id: 'EDIT_SLOT',
		keys: [{ textKey: 'e' }],
		displayKey: 'e',
		displayText: 'edit password',
		helpSection: 'Actions',
		helpLabel: 'Change slot password',
		footer: 'hidden',
		isEnabled: (deps) => notInputting(deps) && deps.ui.activeTab === 'slots',
		execute: () => {},
	},
];

const { CommandsProvider, useCommands, COMMANDS } =
	createCommandsProvider<EnvLockDeps>(PROJECT_COMMANDS);

export { CommandsProvider, useCommands, COMMANDS, PROJECT_COMMANDS };
export type { EnvLockCommand, EnvLockDeps };
