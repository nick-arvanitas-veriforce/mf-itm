#!/usr/bin/env bash
# Resolves the container CLI to use, and runs it with the arguments given.
#
# `docker` is often a shell ALIAS for podman (as it is on this machine). Aliases
# only exist in an interactive shell — npm/pnpm scripts run a non-interactive one,
# where `docker` then does not exist at all. Detecting the real binary here keeps
# the package.json scripts working on Docker Desktop, Podman, or Colima without
# each developer editing them.
#
# Override with CONTAINER_CLI=... to force a specific one.

set -euo pipefail

resolve_cli() {
  if [ -n "${CONTAINER_CLI:-}" ]; then
    echo "$CONTAINER_CLI"
    return
  fi
  # Prefer a real docker binary; fall back to podman, which is CLI-compatible for
  # everything this repo uses (compose, inspect, exec).
  if command -v docker >/dev/null 2>&1; then
    echo docker
  elif command -v podman >/dev/null 2>&1; then
    echo podman
  else
    echo "✗ No container CLI found. Install Docker Desktop or Podman, then retry." >&2
    echo "  (Or set CONTAINER_CLI to the binary you use.)" >&2
    exit 1
  fi
}

CLI="$(resolve_cli)"

if ! "$CLI" info >/dev/null 2>&1; then
  echo "✗ '$CLI' is installed but not running." >&2
  if [ "$CLI" = "podman" ]; then
    echo "  Start it with: podman machine start" >&2
  else
    echo "  Start Docker Desktop, then retry." >&2
  fi
  exit 1
fi

exec "$CLI" "$@"
