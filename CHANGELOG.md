# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [126.1.0] - 2026-03-19

### Added

- Breadcrumb header with `●/○` tab indicators matching spec-tui pattern
- Tab key cycles between Secrets and Slots panels
- Full command system: all keyboard shortcuts registered (navigate, add, delete, edit, save)
- Help override with `inputActive` guard
- Confirmation dialogs via toolkit's `requestConfirmation` for all delete operations

### Changed

- Replaced inline `(y/N)` delete confirmations with toolkit confirmation system
- Selection indicator changed from `>` to `▸`
- Selection color uses `theme.brand` instead of hardcoded `'cyan'`
- Tab navigation changed from `←/→` arrows to `Tab` key (matches run-tui split pane pattern)
- Inline `[Secrets] [Slots]` text removed from content — header is single source of truth
- `SecretList.consts.ts` uses `theme` properties instead of hardcoded color strings
- All `useInput` handlers guard against `ui.confirmation`
- Toolkit bumped to 0.0.26-3-19a
- Biome updated to 2.4.8

### Removed

- Custom `StatusBar` component (unused)
- Custom `ConfirmDialog` component (unused — replaced by toolkit confirmation)
- Inline tab indicators from content area

## [126.0.0] - 2026-02-24

### Added

- Initial release of env-lock
- Encrypted environment variable injection using AES-256-GCM
- Multi-lock slot system for team key management
- Interactive TUI editor for managing secrets and slots
- CLI commands: `lock`, `unlock`, `inject`, `edit`
- Support for `.env.locked` file format
