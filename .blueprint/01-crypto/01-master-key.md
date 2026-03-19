---
title: Master Key Generation
teleport:
  file: src/crypto/masterKey/index.ts
  line: 5
  highlight: generateMasterKey
---

# Master Key

The `generateMasterKey` function at line 5 generates a cryptographically random 32-byte (256-bit) key using Node's `crypto.randomBytes`. This master key is the single secret that encrypts all environment variables.

## How it works

The master key is never stored in plaintext. Instead, each user slot wraps a copy of it using a password-derived key (see the slot system in the next step). This means multiple team members can each unlock the same secrets with their own passwords, without sharing the raw master key.

## Key functions

When you run `env-lock rotate`, a new master key is generated, secrets are re-encrypted, and all existing slots are removed except the current user's. Press `o` to teleport.
