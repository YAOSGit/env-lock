# Basic Example

Minimal env-lock setup: one slot, one `.env` file, one command.

## What's included

| File            | Description                          |
| --------------- | ------------------------------------ |
| `.env`          | Plaintext secrets (for reference)    |
| `.env.enc`      | Encrypted secrets (committed to git) |
| `env-lock.json` | Lockbox with a single user slot      |
| `app.js`        | Sample app that reads `process.env`  |

## Credentials

| Slot    | Password |
| ------- | -------- |
| `admin` | `1234`   |

## Try it

```bash
# Decrypt and run the app
ENV_LOCK_PASSWORD=1234 env-lock run -- node app.js
```

## Recreate from scratch

```bash
# 1. Initialize a lockbox
ENV_LOCK_PASSWORD=1234 env-lock init admin

# 2. Encrypt the .env file
ENV_LOCK_PASSWORD=1234 env-lock seal .env

# 3. Run any command with secrets injected
ENV_LOCK_PASSWORD=1234 env-lock run -- node app.js
```
