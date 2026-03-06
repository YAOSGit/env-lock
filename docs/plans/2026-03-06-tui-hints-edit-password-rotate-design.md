# TUI StatusBar Hints + Slot Password Edit + CLI Rotate

## Context

The TUI has keybindings for adding/deleting secrets and slots, but none are discoverable — the StatusBar only shows static `<> tabs | q quit` hints. Additionally, there's no way to change a slot's password, and no CLI command to rotate the master key.

## Changes

### 1. Context-sensitive StatusBar hints

The StatusBar in `app.tsx` renders different hints based on `activeTab`:

- **Secrets tab:** `a add | e edit | d delete | s save | <> tabs | q quit`
- **Slots tab:** `a add | e edit | d delete | <> tabs | q quit`

### 2. Edit own slot password (TUI)

Press `e` on the Slots tab to change the password of the slot you authenticated with. Pressing `e` on any other slot is ignored.

Flow:
1. Press `e` on the unlocked slot
2. Type new password, press Enter
3. Master key is re-wrapped with the new password, slot is replaced in the lockbox

Requires tracking the unlocked slot ID in `SecretProvider` and passing it to `SlotList`.

A new `replaceSlot` method is added to `LockboxProvider` to atomically swap a slot by ID.

### 3. CLI `rotate` command

`env-lock rotate` — rotates the master key and removes all other slots.

Flow:
1. Load lockbox and envelope (fail if either missing)
2. Authenticate with existing password to get old master key
3. Decrypt `.env.enc` with old master key
4. Generate new master key
5. Re-encrypt secrets with new master key, save `.env.enc`
6. Create single slot (same ID, same password) wrapping new master key
7. Save lockbox with only that slot
8. Print success + warning: "All other slots removed. Re-add team members with the TUI."

## Files changed

| File | Change |
|------|--------|
| `src/app/app.tsx` | Tab-aware StatusBar hints; pass `unlockedSlotId` to SlotList |
| `src/providers/SecretProvider/index.tsx` | Track + expose `unlockedSlotId` |
| `src/providers/SecretProvider/SecretProvider.types.ts` | Add `unlockedSlotId` to context |
| `src/components/SlotList/index.tsx` | `e` keybinding + `editing-password` mode |
| `src/components/SlotList/SlotList.types.ts` | Add `editing-password` mode, `unlockedSlotId` and `onReplaceSlot` props |
| `src/providers/LockboxProvider/index.tsx` | Add `replaceSlot` method |
| `src/providers/LockboxProvider/LockboxProvider.types.ts` | Add `replaceSlot` to context |
| `src/app/cli.ts` | Add `rotate` command |
| Tests | Update existing, add new for rotate + edit password |
