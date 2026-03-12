<p align="center">
  <a href="https://github.com/YAOSGit/env-lock">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YAOSGit/.github/main/profile/images/env-lock.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YAOSGit/.github/main/profile/images/env-lock-light.svg">
      <img src="https://raw.githubusercontent.com/YAOSGit/.github/main/profile/images/env-lock.svg" width="100%" alt="env-lock" />
    </picture>
  </a>
</p>

<p align="center">
  <strong>Security-first encrypted environment injection with multi-lock team access</strong>
</p>

<div align="center">

![Node Version](https://img.shields.io/badge/NODE-18+-16161D?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=%235FA04E)
![TypeScript Version](https://img.shields.io/badge/TYPESCRIPT-5.9-16161D?style=for-the-badge&logo=typescript&logoColor=white&labelColor=%233178C6)
![React Version](https://img.shields.io/badge/REACT-19.2-16161D?style=for-the-badge&logo=react&logoColor=black&labelColor=%2361DAFB)

![Uses Ink](https://img.shields.io/badge/INK-16161D?style=for-the-badge&logo=react&logoColor=white&labelColor=%2361DAFB)
![Uses Vitest](https://img.shields.io/badge/VITEST-16161D?style=for-the-badge&logo=vitest&logoColor=white&labelColor=%236E9F18)
![Uses Biome](https://img.shields.io/badge/BIOME-16161D?style=for-the-badge&logo=biome&logoColor=white&labelColor=%2360A5FA)

</div>

---

## Table of Contents

### Getting Started

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [CLI Usage](#cli-usage)

### Architecture

- [The Lockbox Pattern](#the-lockbox-pattern)
- [File Structure](#file-structure)
- [Encryption Details](#encryption-details)

### TUI

- [Secret Editor](#secret-editor)
- [Slot Management](#slot-management)

### Development

- [Available Scripts](#available-scripts)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)

---

## Overview

**env-lock** is a CLI tool that lets you commit encrypted secrets to version control. It uses a "Multi-Lock" system — a shared Master Key encrypted with individual user credentials — so any team member with a valid password can decrypt the same secrets at runtime.

Secrets are decrypted directly into process memory. Plain-text never touches disk.

### What Makes This Project Unique

- **Commit Secrets to Git**: Encrypted `.env.enc` files are safe to version control
- **Multi-Lock Access**: Multiple passwords unlock the same secrets without re-encryption
- **Memory-Only Runtime**: Decrypted values injected into child process env, never written to disk
- **Schema Validation**: Zod validates that all required env vars are present after decryption

---

## Installation

```bash
# Install globally from npm
npm install -g @yaos-git/env-lock

# Or install as a dev dependency
npm install -D @yaos-git/env-lock
```

### From Source

```bash
# Clone the repository
git clone https://github.com/YAOSGit/env-lock.git
cd env-lock

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link
```

---

## Quick Start

```bash
# 1. Initialize — creates Master Key and your first user slot
env-lock init alice

# 2. Seal your .env file into encrypted .env.enc
env-lock seal .env

# 3. Run your app with secrets decrypted into memory
env-lock run -- npm run dev
```

> **Note:** After sealing, you can delete the plain-text `.env` and commit `.env.enc` + `env-lock.json` to git.

---

## CLI Usage

```text
env-lock init <slot-id>           Create lockbox and first user slot
env-lock seal <file>              Encrypt a plain-text .env → .env.enc
env-lock run -- <command>         Decrypt secrets into memory and spawn command
env-lock --help, -h               Show help message
env-lock --version, -v            Show version information
```

| Command | `ENV_LOCK_PASSWORD` | Behavior |
|---------|:-------------------:|----------|
| `init`  | Optional | Prompts for password if not set |
| `seal`  | Optional | Prompts for password if not set |
| `run`   | **Required** | No interactive prompt — exits if missing |

### Examples

```bash
# Initialize the lockbox with a slot id
env-lock init alice

# Encrypt your environment file
env-lock seal .env

# Run a dev server with decrypted secrets
env-lock run -- npm run dev

# Run Docker Compose with secrets
env-lock run -- docker compose up

# Launch the TUI for secret editing and slot management
env-lock-tui
```

---

## The Lockbox Pattern

env-lock uses a **slot-based encryption architecture** to support multiple users:

1. A randomly generated **Master Key (MK)** encrypts the actual secrets (AES-256-GCM)
2. Each team member has a **slot** containing the MK wrapped with their personal key
3. Personal keys are derived from passwords via **Argon2id** or **PBKDF2**
4. Any valid slot can "unwrap" the MK, which then decrypts the environment variables

### Benefits

- Adding a new member creates a new slot — the secrets themselves are never re-encrypted
- Removing a member just deletes their slot
- Rotating the Master Key is independent of user credentials

---

## File Structure

| File | Committed to Git | Description |
|------|:----------------:|-------------|
| `.env.enc` | Yes | AES-256-GCM encrypted secrets payload |
| `env-lock.json` | Yes | Lockbox metadata (salts, iterations, wrapped keys) |
| `.env.keys` | No | Optional local MK cache for automated dev environments |

---

## Encryption Details

| Layer | Algorithm | Purpose |
|-------|-----------|---------|
| Key Derivation | Argon2id / PBKDF2 | Turn passwords into cryptographic keys |
| Secret Encryption | AES-256-GCM | Authenticated encryption of env vars |
| Key Wrapping | AES-256-GCM | Wrap Master Key per user slot |

All cryptographic operations use `node:crypto` built-ins. No third-party crypto libraries.

---

## Secret Editor

Launch with `env-lock-tui`. Opens a two-tab terminal UI built with Ink.

- Auto-unlocks with `ENV_LOCK_PASSWORD` if available; otherwise prompts interactively

### Secrets Tab

View, edit, add, and delete environment variables. Saving re-encrypts the payload in place — plain-text never touches disk.

### Slots Tab

View existing user slots, add new members, and remove members. Adding a member wraps the Master Key with a new key derived from the member's password.

### Keybindings

| Key | Action |
|-----|--------|
| `←` / `→` | Switch tabs |
| `↑` / `↓` | Navigate list |
| `e` | Edit selected item |
| `a` | Add new item |
| `d` | Delete selected item |
| `s` | Save changes |
| `q` | Quit |

---

## Slot Management

Slot management is integrated into the TUI (**Slots** tab). From the TUI you can:

1. View all existing user slots
2. Add a new member — prompts for a password, derives a key, wraps the Master Key, and saves the slot to `env-lock.json`
3. Remove a member — deletes the slot from `env-lock.json`

---

## Available Scripts

### Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run TypeScript checking + test watcher concurrently |
| `npm run dev:typescript` | Run TypeScript type checking in watch mode |
| `npm run dev:test` | Run Vitest in watch mode |

### Build Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Bundle the CLI with esbuild |

### Lint Scripts

| Script | Description |
|--------|-------------|
| `npm run lint` | Run type checking, linting, formatting, and audit |
| `npm run lint:check` | Check code for linting issues with Biome |
| `npm run lint:fix` | Check and fix linting issues with Biome |
| `npm run lint:format` | Format all files with Biome |
| `npm run lint:types` | Run TypeScript type checking only |
| `npm run lint:audit` | Run npm audit |

### Testing Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests (unit, react, types, e2e) |
| `npm run test:unit` | Run unit tests |
| `npm run test:react` | Run React component tests |
| `npm run test:types` | Run type-level tests |
| `npm run test:e2e` | Run end-to-end tests |

---

## Tech Stack

### Core

- **[TypeScript 5](https://www.typescriptlang.org/)** — Type-safe JavaScript
- **[node:crypto](https://nodejs.org/api/crypto.html)** — AES-256-GCM encryption
- **[Zod](https://zod.dev/)** — Runtime schema validation
- **[React 19](https://react.dev/)** — UI component library
- **[Ink 6](https://github.com/vadimdemedes/ink)** — React for CLIs

### Build & Development

- **[esbuild](https://esbuild.github.io/)** — Fast bundler
- **[Vitest](https://vitest.dev/)** — Unit testing framework
- **[Biome](https://biomejs.dev/)** — Linter and formatter

### UI Components

- **[@inkjs/ui](https://github.com/vadimdemedes/ink-ui)** — Ink UI components
- **[Chalk](https://github.com/chalk/chalk)** — Terminal string styling

---

## Project Structure

```
env-lock/
├── src/
│   ├── app/                    # Application entry points
│   │   ├── cli.ts              # CLI entry point (Commander)
│   │   ├── editor-cli.tsx      # TUI entry point (env-lock-tui)
│   │   ├── app.tsx             # Main TUI application (tab shell)
│   │   ├── index.tsx           # React app root
│   │   └── providers.tsx       # Provider wrapper
│   ├── components/             # React (Ink) components
│   │   ├── PasswordPrompt/     # Password input with masked characters
│   │   ├── SecretList/         # Env var list with edit/add/delete
│   │   ├── SlotList/           # User slot list with add/remove
│   │   ├── ConfirmDialog/      # Yes/No confirmation dialog
│   │   └── StatusBar/          # Bottom status bar with keybindings
│   ├── crypto/                 # Cryptographic modules
│   │   ├── aes/                # AES-256-GCM encrypt/decrypt
│   │   ├── kdf/                # Key derivation (Argon2id/PBKDF2)
│   │   ├── masterKey/          # Master Key generation
│   │   └── slot/               # User slot wrap/unwrap
│   ├── hooks/                  # React hooks
│   │   ├── useLockbox/         # Lockbox unlock & slot operations
│   │   └── useSecrets/         # Secret CRUD & re-encryption
│   ├── providers/              # React context providers
│   │   ├── LockboxProvider/    # Lockbox state & Master Key context
│   │   └── SecretProvider/     # Decrypted secrets context
│   ├── types/                  # TypeScript type definitions
│   │   ├── Envelope/           # Encrypted envelope type
│   │   ├── EnvSchema/          # Environment schema type
│   │   ├── Lockbox/            # Lockbox metadata type
│   │   └── Slot/               # User slot type
│   └── utils/                  # Utility functions
│       ├── envParser/          # .env file parser
│       ├── envelope/           # Envelope serialization
│       ├── executor/           # Child process spawner
│       ├── lockbox/            # Lockbox file operations
│       └── prompt/             # Interactive password prompt (CLI)
├── e2e/                        # End-to-end tests
├── biome.json                  # Biome configuration
├── tsconfig.json               # TypeScript configuration
├── vitest.unit.config.ts       # Unit test configuration
├── vitest.react.config.ts      # React test configuration
├── vitest.type.config.ts       # Type test configuration
├── vitest.e2e.config.ts        # E2E test configuration
├── esbuild.config.js           # esbuild bundler configuration
└── package.json
```

---

## Versioning

This project uses a custom versioning scheme: `MAJORYY.MINOR.PATCH`

| Part | Description | Example |
|------|-------------|---------|
| `MAJOR` | Major version number | `1` |
| `YY` | Year (last 2 digits) | `26` for 2026 |
| `MINOR` | Minor version | `0` |
| `PATCH` | Patch version | `0` |

**Example:** `126.0.0` = Major version 1, released in 2026, minor 0, patch 0

---

## Style Guide

Conventions for contributing to this project. All rules are enforced by code review; Biome handles formatting and lint.

### Exports

- **Named exports only** — no `export default`. Every module uses `export function`, `export const`, or `export type`.
- **`import type`** — always use `import type` for type-only imports.
- **`.js` extensions** — all relative imports use explicit `.js` extensions (ESM requirement).

### File Structure

```
src/
├── app/              # Entry points and root component
├── components/       # React components (PascalCase directories)
│   └── MyComponent/
│       ├── index.tsx
│       ├── MyComponent.types.ts
│       └── MyComponent.test.tsx
├── crypto/           # Cryptographic primitives (lowercase directories)
├── hooks/            # Hook re-exports (public API for context hooks)
├── providers/        # React context providers (PascalCase directories)
│   └── MyProvider/
│       ├── index.tsx
│       ├── MyProvider.types.ts
│       └── MyProvider.test.tsx
├── types/            # Shared type definitions (PascalCase directories)
│   └── MyType/
│       ├── index.ts
│       └── MyType.test-d.ts
└── utils/            # Pure utility functions (camelCase directories)
    └── myUtil/
        ├── index.ts
        └── myUtil.test.ts
```

### Components & Providers

- **Components** use `function` declarations: `export function MyComponent(props: MyComponentProps) {}`
- **Providers** use `React.FC` arrow syntax: `export const MyProvider: React.FC<Props> = ({ children }) => {}`
- **Props** are defined in a co-located `.types.ts` file using the `type` keyword.
- Components receive data via props — never read `process.stdout` or global state directly.

### Types

- Use `type` for all type definitions — never `interface`.
- Shared types live in `src/types/TypeName/index.ts` with a co-located `TypeName.test-d.ts`.
- Local types live in co-located `.types.ts` files — never inline in implementation files.
- No duplicate type definitions — import from the canonical source.

### Constants

- Named constants go in `.consts.ts` files.
- No magic numbers in implementation files — extract to named constants.

### Testing

- Every module has a co-located test file.
- Components: `ComponentName.test.tsx`
- Hooks: `hookName.test.tsx`
- Utils: `utilName.test.ts`
- Types: `TypeName.test-d.ts` (type-level tests using `expectTypeOf`/`assertType`)

---

## License

ISC
