---
title: Try It
actions:
  - label: Initialize a lockbox
    command: node dist/cli.js init my-slot
---

# Initialize Your First Lockbox

Press `r` to run `env-lock init my-slot`. This creates an `env-lock.json` file containing a single user slot identified as "my-slot". You will be prompted for a password that protects your slot.

## How it works

The init command generates a random 256-bit master key, wraps it with your password using PBKDF2 (600,000 iterations), and stores the wrapped key in the slot. The master key never appears in plaintext on disk.

## What to do

After init, create a `.env` file with your secrets and run `env-lock seal .env` to encrypt it. Then use `env-lock run -- your-command` to inject secrets into any process.
