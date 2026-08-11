#!/usr/bin/env bash
# Blocks until the local Postgres container is accepting queries.
#
# `docker compose up -d` returns as soon as the container is CREATED, which is well
# before Postgres is ready. Without this wait the backends start first, fail their
# startup migration, and exit — a race that shows up as an intermittent
# "connection refused" a few times a week rather than every run.
#
# Uses the container's own pg_isready via the compose healthcheck, so it needs no
# Postgres client installed on the host.

set -euo pipefail

CONTAINER="mf-itm-postgres"
TIMEOUT_SECONDS="${DB_WAIT_TIMEOUT:-60}"

# Resolve docker/podman the same way the db:* scripts do — and let its error
# message (which knows how to start the runtime it found) surface if it is down.
CLI_WRAPPER="$(dirname "$0")/container-cli.sh"
bash "$CLI_WRAPPER" info >/dev/null

cli() { bash "$CLI_WRAPPER" "$@"; }

printf 'Waiting for Postgres'

elapsed=0
until [ "$(cli inspect -f '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null)" = "healthy" ]; do
  if [ "$elapsed" -ge "$TIMEOUT_SECONDS" ]; then
    echo
    echo "✗ Postgres was not ready after ${TIMEOUT_SECONDS}s." >&2
    echo "  Check it with: pnpm exec bash scripts/container-cli.sh compose logs postgres" >&2
    exit 1
  fi

  # A container that exited will never become healthy — fail now with the reason
  # rather than spinning until the timeout.
  state="$(cli inspect -f '{{.State.Status}}' "$CONTAINER" 2>/dev/null || echo missing)"
  if [ "$state" = "exited" ] || [ "$state" = "dead" ]; then
    echo
    echo "✗ The Postgres container stopped ($state). Its logs:" >&2
    cli compose logs --tail 20 postgres >&2
    exit 1
  fi

  printf '.'
  sleep 1
  elapsed=$((elapsed + 1))
done

echo " ready."
