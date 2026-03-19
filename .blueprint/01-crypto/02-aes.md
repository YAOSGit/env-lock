---
title: AES-256-GCM Encryption
teleport:
  file: src/crypto/aes/index.ts
  line: 7
  highlight: aesEncrypt
---

# AES-256-GCM Encryption

The `aesEncrypt` function at line 7 encrypts plaintext using AES-256-GCM with a random 12-byte IV. It returns an `Envelope` containing the base64-encoded ciphertext, IV, and authentication tag. The auth tag provides tamper detection -- decryption fails if any byte is modified.

## Key functions

The `aesDecrypt` function reverses the process: it reconstructs the cipher from the envelope fields, sets the auth tag, and decrypts. Both functions are used in two places: encrypting the `.env` content with the master key, and wrapping the master key itself inside each slot.

## How it works

GCM mode was chosen for its authenticated encryption, which prevents both reading and tampering with the encrypted data. Press `o` to teleport.
