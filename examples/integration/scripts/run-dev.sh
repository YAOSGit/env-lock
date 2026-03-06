#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/.."
ENV_DIR="$ROOT/environments/dev"

cd "$ENV_DIR"
env-lock run -- node "$ROOT/app.js"
