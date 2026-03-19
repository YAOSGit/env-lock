---
title: Password Prompt
teleport:
  file: src/components/PasswordPrompt/index.tsx
  line: 7
  highlight: PasswordPrompt
---

# Pre-Auth Password Screen

The `PasswordPrompt` component at line 7 is the first screen users see when launching the TUI. It captures the password as masked input (asterisks), with character-by-character handling via Ink's `useInput` hook.

## How it works

Pressing Enter submits the password to the parent's `onSubmit` callback, which attempts to unlock a slot. If no slot matches, an error message is displayed below the input. Backspace deletes characters, and control/meta keys are ignored to prevent accidental input.

## What to expect

The component is intentionally minimal -- no tab navigation or overlays -- so the user's focus stays on entering their password. Once unlocked, the parent swaps in the full Secrets/Slots panel view. Press `o` to teleport.
