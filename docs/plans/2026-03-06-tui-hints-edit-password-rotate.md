# TUI Hints, Slot Password Edit, CLI Rotate — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make TUI keybindings discoverable via tab-aware status bar hints, allow editing the authenticated slot's password, and add a CLI `rotate` command that re-keys the master key.

**Architecture:** The StatusBar in `app.tsx` already receives children — we switch those children based on `activeTab`. The `SecretProvider` gains `unlockedSlotId` tracking. `LockboxProvider` gains a `replaceSlot` method. The CLI gets a new `rotate` command that decrypts, re-keys, re-encrypts, and prunes slots.

**Tech Stack:** TypeScript, React (Ink), Commander, Node crypto, Vitest, ink-testing-library

---

### Task 1: Add `replaceSlot` to LockboxProvider

**Files:**
- Modify: `src/providers/LockboxProvider/LockboxProvider.types.ts:1-14`
- Modify: `src/providers/LockboxProvider/index.tsx:1-56`

**Step 1: Write the failing test**

Add to `src/hooks/useLockbox/useLockbox.test.tsx` (read it first — it may exist or need creation). Since the provider is tested via integration in `app.test.tsx`, we'll verify via the SlotList test in Task 4. For now, just make the type and implementation changes.

**Step 2: Add `replaceSlot` to the types**

In `src/providers/LockboxProvider/LockboxProvider.types.ts`, add `replaceSlot` to `LockboxContextValue`:

```typescript
export type LockboxContextValue = {
	lockbox: Lockbox | null;
	reload: () => void;
	addSlot: (slot: Slot) => void;
	removeSlot: (slotId: string) => void;
	replaceSlot: (slotId: string, newSlot: Slot) => void;
};
```

**Step 3: Implement `replaceSlot` in the provider**

In `src/providers/LockboxProvider/index.tsx`, add after the `removeSlot` callback:

```typescript
const replaceSlot = useCallback((slotId: string, newSlot: Slot) => {
	setLockbox((prev) => {
		if (!prev) return prev;
		const updated = {
			...prev,
			slots: prev.slots.map((s) => (s.id === slotId ? newSlot : s)),
		};
		saveLockbox(updated);
		return updated;
	});
}, []);
```

Update the Provider value to include `replaceSlot`:

```tsx
<LockboxContext.Provider value={{ lockbox, reload, addSlot, removeSlot, replaceSlot }}>
```

**Step 4: Run tests to verify nothing breaks**

Run: `cd /Users/ygorbarros/Desktop/YAOS-git/env-lock && npm run test:react`
Expected: All existing tests PASS

**Step 5: Commit**

```bash
git add src/providers/LockboxProvider/
git commit -m "feat(lockbox): add replaceSlot method to LockboxProvider"
```

---

### Task 2: Track `unlockedSlotId` in SecretProvider

**Files:**
- Modify: `src/providers/SecretProvider/SecretProvider.types.ts:1-15`
- Modify: `src/providers/SecretProvider/index.tsx:1-103`

**Step 1: Add `unlockedSlotId` to the context type**

In `src/providers/SecretProvider/SecretProvider.types.ts`:

```typescript
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
```

**Step 2: Track `unlockedSlotId` in the provider**

In `src/providers/SecretProvider/index.tsx`:

Add a ref next to `mkRef`:

```typescript
const slotIdRef = useRef<string | null>(null);
```

In the `unlock` callback, inside the `try` block after `mkRef.current = mk;`, add:

```typescript
slotIdRef.current = slot.id;
```

Add `unlockedSlotId` to the Provider value:

```typescript
unlockedSlotId: slotIdRef.current,
```

**Step 3: Run tests to verify nothing breaks**

Run: `cd /Users/ygorbarros/Desktop/YAOS-git/env-lock && npm run test:react`
Expected: All existing tests PASS

**Step 4: Commit**

```bash
git add src/providers/SecretProvider/
git commit -m "feat(secrets): track unlockedSlotId in SecretProvider"
```

---

### Task 3: Context-sensitive StatusBar hints in app.tsx

**Files:**
- Modify: `src/app/app.tsx:110-173`

**Step 1: Write the failing test**

In `src/app/app.test.tsx`, the app mocks prevent full rendering. Since the StatusBar is driven by `activeTab` state which is internal to `AppContent`, we test this visually through the existing component and verify the hints appear. Add a test:

```typescript
it('shows hint text for tabs and quit', () => {
	const { lastFrame } = render(<App />);
	expect(lastFrame()).toContain('tabs');
	expect(lastFrame()).toContain('quit');
});
```

Run: `cd /Users/ygorbarros/Desktop/YAOS-git/env-lock && npm run test:react`
Expected: This test should already pass with existing code (the static hints already show `tabs` and `quit`). This confirms the baseline.

**Step 2: Replace static StatusBar children with tab-aware hints**

In `src/app/app.tsx`, replace the StatusBar block (lines ~150-172) with:

```tsx
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
	{activeTab === 'secrets' ? (
		<>
			<Text bold>a</Text><Text> add</Text>
			<Text dimColor> | </Text>
			<Text bold>e</Text><Text> edit</Text>
			<Text dimColor> | </Text>
			<Text bold>d</Text><Text> delete</Text>
			<Text dimColor> | </Text>
			<Text bold>s</Text><Text> save</Text>
		</>
	) : (
		<>
			<Text bold>a</Text><Text> add</Text>
			<Text dimColor> | </Text>
			<Text bold>e</Text><Text> edit</Text>
			<Text dimColor> | </Text>
			<Text bold>d</Text><Text> delete</Text>
		</>
	)}
	<Text dimColor> | </Text>
	<Text bold>{'<>'}</Text>
	<Text> tabs</Text>
	<Text dimColor> | </Text>
	<Text bold>q</Text>
	<Text> quit</Text>
</StatusBar>
```

**Step 3: Run tests**

Run: `cd /Users/ygorbarros/Desktop/YAOS-git/env-lock && npm run test:react`
Expected: All PASS

**Step 4: Commit**

```bash
git add src/app/app.tsx src/app/app.test.tsx
git commit -m "feat(tui): show context-sensitive keybinding hints in StatusBar"
```

---

### Task 4: Add `e` keybinding for editing slot password

**Files:**
- Modify: `src/components/SlotList/SlotList.types.ts:1-13`
- Modify: `src/components/SlotList/index.tsx:1-117`
- Modify: `src/components/SlotList/SlotList.test.tsx:1-71`
- Modify: `src/app/app.tsx` (pass new props)

**Step 1: Update SlotList types**

In `src/components/SlotList/SlotList.types.ts`:

```typescript
import type { Slot } from '../../types/Slot/index.js';

export type SlotListProps = {
	slots: Slot[];
	unlockedSlotId: string | null;
	onAddSlot: (slotId: string, password: string) => void;
	onRemoveSlot: (slotId: string) => void;
	onReplaceSlot: (slotId: string, newPassword: string) => void;
};

export type Mode =
	| { type: 'browse' }
	| { type: 'adding-id'; value: string }
	| { type: 'adding-password'; slotId: string; value: string }
	| { type: 'confirm-delete'; slotId: string }
	| { type: 'editing-password'; slotId: string; value: string };
```

**Step 2: Write the failing test for edit password**

In `src/components/SlotList/SlotList.test.tsx`, add:

```typescript
it('calls onReplaceSlot when e is pressed on unlocked slot', async () => {
	const delay = () => new Promise((r) => setTimeout(r, 50));
	const onReplaceSlot = vi.fn();
	const { stdin } = render(
		<SlotList
			slots={baseSlots}
			unlockedSlotId="alice@test.com"
			onAddSlot={vi.fn()}
			onRemoveSlot={vi.fn()}
			onReplaceSlot={onReplaceSlot}
		/>,
	);
	await delay();

	stdin.write('e');
	await delay();
	stdin.write('newpass');
	await delay();
	stdin.write('\r');
	await delay();

	expect(onReplaceSlot).toHaveBeenCalledWith('alice@test.com', 'newpass');
});

it('ignores e on a slot that is not the unlocked slot', async () => {
	const delay = () => new Promise((r) => setTimeout(r, 50));
	const onReplaceSlot = vi.fn();
	const { stdin, lastFrame } = render(
		<SlotList
			slots={baseSlots}
			unlockedSlotId="bob@test.com"
			onAddSlot={vi.fn()}
			onRemoveSlot={vi.fn()}
			onReplaceSlot={onReplaceSlot}
		/>,
	);
	await delay();

	// cursor starts on alice (index 0), but bob is unlocked
	stdin.write('e');
	await delay();

	expect(onReplaceSlot).not.toHaveBeenCalled();
	expect(lastFrame()).not.toContain('New password');
});
```

**Step 3: Run tests to verify they fail**

Run: `cd /Users/ygorbarros/Desktop/YAOS-git/env-lock && npm run test:react -- --reporter verbose 2>&1 | tail -20`
Expected: FAIL — `onReplaceSlot` is not a recognized prop / missing mode

**Step 4: Update existing tests to pass new required props**

Update all existing `<SlotList>` renders in the test file to include:

```tsx
unlockedSlotId="alice@test.com"
onReplaceSlot={vi.fn()}
```

**Step 5: Implement `editing-password` mode in SlotList**

In `src/components/SlotList/index.tsx`, update the component signature:

```typescript
export const SlotList: React.FC<SlotListProps> = ({
	slots,
	unlockedSlotId,
	onAddSlot,
	onRemoveSlot,
	onReplaceSlot,
}) => {
```

Add the `editing-password` handler after the `adding-password` block in `useInput`:

```typescript
if (mode.type === 'editing-password') {
	if (key.return) {
		if (mode.value) {
			onReplaceSlot(mode.slotId, mode.value);
		}
		setMode({ type: 'browse' });
	} else if (key.escape) {
		setMode({ type: 'browse' });
	} else if (key.backspace || key.delete) {
		setMode({ ...mode, value: mode.value.slice(0, -1) });
	} else if (input && !key.ctrl && !key.meta) {
		setMode({ ...mode, value: mode.value + input });
	}
	return;
}
```

In the browse mode section, add the `e` keybinding after the `a` handler:

```typescript
} else if (input === 'e' && slots.length > 0) {
	const selected = slots[selectedIndex];
	if (selected && selected.id === unlockedSlotId) {
		setMode({ type: 'editing-password', slotId: selected.id, value: '' });
	}
}
```

Add the UI for `editing-password` mode in the JSX, after the `adding-password` block:

```tsx
{mode.type === 'editing-password' ? (
	<Box marginTop={1}>
		<Text color="green">New password for {mode.slotId}: </Text>
		<Text>{'*'.repeat(mode.value.length)}</Text>
		<Text dimColor>|</Text>
	</Box>
) : null}
```

**Step 6: Wire up in app.tsx**

In `src/app/app.tsx`, destructure `replaceSlot` and `unlockedSlotId`:

```typescript
const { lockbox, addSlot, removeSlot, replaceSlot } = useLockbox();
```

```typescript
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
```

Add the `handleReplaceSlot` handler after `handleAddSlot`:

```typescript
const handleReplaceSlot = (slotId: string, newPassword: string) => {
	if (!masterKey) return;
	const newSlot = createSlot(masterKey, newPassword, slotId);
	replaceSlot(slotId, newSlot);
};
```

Update the `<SlotList>` render to pass new props:

```tsx
<SlotList
	slots={lockbox.slots}
	unlockedSlotId={unlockedSlotId}
	onAddSlot={handleAddSlot}
	onRemoveSlot={removeSlot}
	onReplaceSlot={handleReplaceSlot}
/>
```

**Step 7: Run tests**

Run: `cd /Users/ygorbarros/Desktop/YAOS-git/env-lock && npm run test:react`
Expected: All PASS

**Step 8: Commit**

```bash
git add src/components/SlotList/ src/app/app.tsx src/providers/
git commit -m "feat(tui): add edit password for unlocked slot via 'e' key"
```

---

### Task 5: CLI `rotate` command

**Files:**
- Modify: `src/app/cli.ts:1-188`
- Modify: `src/app/cli.test.ts:1-62`

**Step 1: Write the failing unit test**

In `src/app/cli.test.ts`, add these imports at the top (with existing mocks):

```typescript
import * as envelopeModule from '../utils/envelope/index.js';
import * as aesModule from '../crypto/aes/index.js';
import * as slotModule from '../crypto/slot/index.js';
import * as masterKeyModule from '../crypto/masterKey/index.js';
```

Add test cases:

```typescript
it('rotate fails without lockbox', async () => {
	vi.mocked(lockboxModule.loadLockbox).mockReturnValue(null);
	await runCLI(['rotate']);
	expect(process.exitCode).toBe(1);
});

it('rotate fails without envelope', async () => {
	vi.mocked(lockboxModule.loadLockbox).mockReturnValue({
		version: 1,
		slots: [
			{
				id: 'admin',
				kdf: 'pbkdf2',
				salt: 'c2FsdA==',
				iterations: 600000,
				wrappedKey: 'key==',
				wrappingIv: 'iv==',
				wrappingTag: 'tag==',
				createdAt: '2026-01-01T00:00:00.000Z',
			},
		],
	});
	vi.mocked(envelopeModule.loadEnvelope).mockReturnValue(null);
	await runCLI(['rotate']);
	expect(process.exitCode).toBe(1);
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/ygorbarros/Desktop/YAOS-git/env-lock && npm run test:unit -- --reporter verbose 2>&1 | tail -20`
Expected: FAIL — `rotate` is not a recognized command (Commander exits with code 1, but the error message is about unknown command)

**Step 3: Update the test that asserts `add-member` doesn't exist**

The existing test at line 58 (`it('does not have add-member command'...`) should stay as-is — it tests a different command.

**Step 4: Implement the `rotate` command**

In `src/app/cli.ts`, add after the `run` command block (before the `try/catch` at the bottom):

```typescript
program
	.command('rotate')
	.description('Rotate master key and remove all other slots')
	.action(async () => {
		const lockbox = loadLockbox();
		if (!lockbox) {
			console.error(
				chalk.red('No env-lock.json found. Run "env-lock init" first.'),
			);
			process.exitCode = 1;
			return;
		}

		const envelope = loadEnvelope();
		if (!envelope) {
			console.error(
				chalk.red('No .env.enc found. Run "env-lock seal" first.'),
			);
			process.exitCode = 1;
			return;
		}

		const password = await getPassword();
		if (!password) {
			console.error(chalk.red('No password provided.'));
			process.exitCode = 1;
			return;
		}

		let oldMk: Buffer | null = null;
		let matchedSlotId: string | null = null;
		for (const slot of lockbox.slots) {
			try {
				oldMk = unwrapSlot(slot, password);
				matchedSlotId = slot.id;
				break;
			} catch {}
		}

		if (!oldMk || !matchedSlotId) {
			console.error(
				chalk.red('No slot could be unlocked with the provided password.'),
			);
			process.exitCode = 1;
			return;
		}

		const plaintext = aesDecrypt(envelope, oldMk);
		const newMk = generateMasterKey();
		const newEnvelope = aesEncrypt(plaintext, newMk);
		saveEnvelope(newEnvelope);

		const newSlot = createSlot(newMk, password, matchedSlotId);
		const newLockbox: Lockbox = { version: 1, slots: [newSlot] };
		saveLockbox(newLockbox);

		console.log(chalk.green('Master key rotated successfully.'));
		console.log(
			chalk.yellow(
				'All other slots removed. Re-add team members with the TUI.',
			),
		);
	});
```

**Step 5: Run tests**

Run: `cd /Users/ygorbarros/Desktop/YAOS-git/env-lock && npm run test:unit`
Expected: All PASS

**Step 6: Commit**

```bash
git add src/app/cli.ts src/app/cli.test.ts
git commit -m "feat(cli): add rotate command to re-key master key and prune slots"
```

---

### Task 6: E2E test for `rotate`

**Files:**
- Modify: `e2e/env-lock.e2e.ts:1-59`

**Step 1: Build the dist for e2e**

Run: `cd /Users/ygorbarros/Desktop/YAOS-git/env-lock && npm run build`

**Step 2: Write the e2e test**

Add to `e2e/env-lock.e2e.ts`:

```typescript
it('rotate re-keys and preserves secrets', () => {
	fs.writeFileSync(path.join(tmpDir, '.env'), 'ROTATE_TEST=rotated\n');

	run(['init', 'admin@test.com'], { ENV_LOCK_PASSWORD: 'pass1' });
	run(['seal', '.env'], { ENV_LOCK_PASSWORD: 'pass1' });

	const rotateOutput = run(['rotate'], { ENV_LOCK_PASSWORD: 'pass1' });
	expect(rotateOutput).toContain('Master key rotated');
	expect(rotateOutput).toContain('All other slots removed');

	// Secrets still accessible with same password
	const runOutput = run(
		['run', 'node', '-e', 'console.log(process.env.ROTATE_TEST)'],
		{ ENV_LOCK_PASSWORD: 'pass1' },
	);
	expect(runOutput.trim()).toBe('rotated');

	// Lockbox has only one slot
	const lockbox = JSON.parse(
		fs.readFileSync(path.join(tmpDir, 'env-lock.json'), 'utf-8'),
	);
	expect(lockbox.slots).toHaveLength(1);
	expect(lockbox.slots[0].id).toBe('admin@test.com');
});
```

**Step 3: Run e2e tests**

Run: `cd /Users/ygorbarros/Desktop/YAOS-git/env-lock && npm run test:e2e`
Expected: All PASS

**Step 4: Commit**

```bash
git add e2e/env-lock.e2e.ts
git commit -m "test(e2e): add rotate command end-to-end test"
```

---

### Task 7: Run full test suite

**Step 1: Run all tests**

Run: `cd /Users/ygorbarros/Desktop/YAOS-git/env-lock && npm test`
Expected: All unit, react, type, and e2e tests PASS

**Step 2: Run lint**

Run: `cd /Users/ygorbarros/Desktop/YAOS-git/env-lock && npm run lint`
Expected: No errors

**Step 3: Fix any issues found, commit if needed**
