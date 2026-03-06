# Custom Example

Demonstrates multi-slot team access and schema validation.

## What's included

| File            | Description                                        |
| --------------- | -------------------------------------------------- |
| `.env`          | Plaintext secrets with 10 variables (for reference)|
| `.env.enc`      | Encrypted secrets                                  |
| `env-lock.json` | Lockbox with 3 user slots                          |
| `app.js`        | Prints all injected secrets (masked)               |
| `validate.js`   | Validates secrets against a Zod schema             |

## Multi-Lock: Team Access

The lockbox has three slots. Each team member uses their own password to decrypt the **same** secrets, no shared credentials needed.

| Slot    | Password   | Note                           |
| ------- | ---------- | ------------------------------ |
| `alice` | `1234`     | Numeric password               |
| `bob`   | `000`      | Short numeric password         |
| `carol` | `password` | Alphanumeric password          |

Passwords can be any format: numeric, short, or alphanumeric.

## Try it

Any of these commands will produce the same result:

```bash
# Alice decrypts
ENV_LOCK_PASSWORD=1234 env-lock run -- node app.js

# Bob decrypts
ENV_LOCK_PASSWORD=000 env-lock run -- node app.js

# Carol decrypts
ENV_LOCK_PASSWORD=password env-lock run -- node app.js
```

## Schema Validation

Use Zod to validate and parse secrets at startup:

```bash
ENV_LOCK_PASSWORD=1234 env-lock run -- node validate.js
```

This catches misconfigured secrets early, with typed parsing (strings become numbers/booleans where needed).

## Features Demonstrated

- **Multi-lock access** — 3 users, 3 passwords, same secrets
- **Password flexibility** — numeric, short, and alphanumeric passwords all work
- **Schema validation** — Zod validates and transforms env vars at runtime
- **TUI editing** — Run `env-lock-tui` in this directory to manage secrets and slots interactively
