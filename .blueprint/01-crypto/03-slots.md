---
title: Multi-Lock Slot System
teleport:
  file: src/crypto/slot/index.ts
  line: 7
  highlight: createSlot
---

# Multi-Lock Slots

The `createSlot` function at line 7 wraps a master key for a specific user. It generates a random salt, derives a wrapping key from the user's password via PBKDF2 (600,000 iterations), then AES-encrypts the master key with that wrapping key. The resulting slot stores the salt, iteration count, and encrypted key material.

## How it works

The `unwrapSlot` function at line 32 reverses this: it re-derives the wrapping key from the password and salt, then decrypts to recover the master key. During `seal` or `run`, each slot is tried in sequence until one succeeds, allowing any team member's password to unlock the secrets.

## Data flow

This design means adding a new team member only requires wrapping the existing master key with their password -- no re-encryption of the actual secrets. Press `o` to teleport.
