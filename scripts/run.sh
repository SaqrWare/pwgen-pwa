#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"

# Kill and remove existing container if running
docker rm -f pwgen 2>/dev/null || true

docker run -d --name pwgen -p "${PORT}:80" pwgen
echo "pwgen running on http://localhost:${PORT}"