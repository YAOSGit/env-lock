# Integration Example

Production-like setup with multi-environment secrets and CI/CD integration.

## What's included

```
integration/
├── environments/
│   ├── dev/                  # Development secrets
│   │   ├── .env              # Plaintext (for reference)
│   │   ├── .env.enc          # Encrypted (committed to git)
│   │   └── env-lock.json     # Lockbox with 2 slots
│   ├── staging/              # Staging secrets
│   │   └── ...
│   └── prod/                 # Production secrets
│       └── ...
├── scripts/
│   ├── run-dev.sh            # Run app with dev secrets
│   ├── run-staging.sh        # Run app with staging secrets
│   └── run-prod.sh           # Run app with prod secrets
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions example
├── Dockerfile                # Docker usage example
└── app.js                    # Sample app
```

## Credentials

Each environment has two slots: one for a developer and one for CI.

| Environment | Slot           | Password |
| ----------- | -------------- | -------- |
| dev         | `dev-admin`    | `1234`   |
| dev         | `dev-ci`       | `000`    |
| staging     | `staging-admin`| `1234`   |
| staging     | `staging-ci`   | `000`    |
| prod        | `prod-admin`   | `1234`   |
| prod        | `prod-ci`      | `000`    |

## Try it

### Run locally

```bash
# Development
ENV_LOCK_PASSWORD=1234 ./scripts/run-dev.sh

# Staging
ENV_LOCK_PASSWORD=1234 ./scripts/run-staging.sh

# Production
ENV_LOCK_PASSWORD=1234 ./scripts/run-prod.sh
```

### Docker

```bash
docker build -t my-app .
docker run -e ENV_LOCK_PASSWORD=1234 my-app
```

### CI/CD (GitHub Actions)

The included `deploy.yml` workflow shows how to use env-lock in CI:

1. Store `ENV_LOCK_PASSWORD_STAGING` and `ENV_LOCK_PASSWORD_PROD` as GitHub Secrets
2. The workflow passes the password via the `ENV_LOCK_PASSWORD` environment variable
3. `env-lock run` decrypts secrets at runtime — they never appear in logs or the image

## Multi-Environment Workflow

Each environment is a separate directory with its own lockbox and encrypted envelope. This means:

- **Different secrets per environment** — dev uses local databases, prod uses real ones
- **Different access per environment** — CI gets its own slot with a separate password
- **Independent rotation** — re-seal one environment without touching others
- **Safe to commit** — encrypted files live in version control alongside the code

## Suggested Workflows

```bash
# Full local development
ENV_LOCK_PASSWORD=1234 ./scripts/run-dev.sh

# Pre-deploy check with staging secrets
ENV_LOCK_PASSWORD=1234 ./scripts/run-staging.sh

# Add a new team member to dev
cd environments/dev
ENV_LOCK_PASSWORD=1234 env-lock-tui  # Use TUI to add a slot
```
