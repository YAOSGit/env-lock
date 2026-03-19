---
title: Overview
teleport:
  file: src/app/cli.ts
  line: 31
  highlight: createCLI
---

# env-lock Overview

env-lock provides encrypted environment variable injection with multi-lock team access. Secrets are encrypted with AES-256-GCM and stored in `.env.enc`. A lockbox (`env-lock.json`) holds one or more user slots, each wrapping the master key with a personal password via PBKDF2.

## How it works

The CLI at line 31 registers four commands: `init` creates a new lockbox with the first slot, `seal` encrypts a `.env` file, `run` decrypts secrets and injects them into a child process, and `rotate` generates a new master key. Passwords can be provided via the `ENV_LOCK_PASSWORD` environment variable or interactive prompt.

## What to do

Press `o` to teleport to the CLI setup and see how the commands are structured.
