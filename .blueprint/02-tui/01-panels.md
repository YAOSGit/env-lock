---
title: Secrets and Slots Panels
teleport:
  file: src/app/app.tsx
  line: 23
  highlight: AppContent
---

# TUI Panels

The `AppContent` component at line 23 is the main TUI screen. It renders two tab-switchable panels: **Secrets** (for viewing and editing key-value pairs) and **Slots** (for managing team member access). The active tab is shown in the header with filled/empty circle indicators.

## How it works

Before showing the panels, the component checks for a lockbox and unlock state. If no `env-lock.json` exists, it shows an error. If locked, it renders the `PasswordPrompt` component. The `ENV_LOCK_PASSWORD` env var is checked on mount for CI/non-interactive use.

## What to expect

The Secrets panel supports inline editing, adding, and deleting entries. The Slots panel lets you add new team slots, remove existing ones, or replace a slot's password. Press `o` to teleport.
