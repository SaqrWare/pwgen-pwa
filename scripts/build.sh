#!/usr/bin/env bash
set -euo pipefail

docker build -t pwgen "$(dirname "$0")/.."