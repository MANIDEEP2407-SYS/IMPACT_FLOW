#!/usr/bin/env bash
set -euo pipefail

COLLECTION="$(dirname "$0")/../postman/ImpactFlow.postman_collection.json"
ENV="$(dirname "$0")/../postman/ImpactFlow.postman_environment.json"
REPORT_DIR="$(dirname "$0")/../postman/reports"
mkdir -p "$REPORT_DIR"
LOG_FILE="$REPORT_DIR/report.txt"

# Use only the CLI reporter to avoid external reporter packages.
if ! command -v newman >/dev/null 2>&1; then
  echo "newman not found — installing temporarily with npx"
  npx newman run "$COLLECTION" -e "$ENV" --insecure --reporters cli | tee "$LOG_FILE"
else
  newman run "$COLLECTION" -e "$ENV" --insecure --reporters cli | tee "$LOG_FILE"
fi

echo "Reports written to $LOG_FILE"
