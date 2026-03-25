#!/usr/bin/env bash
# Creates a single archive of this project for GitHub upload / sharing.
# Excludes node_modules, build output, secrets, and other generated junk.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAMP="$(date +%Y%m%d-%H%M)"
OUT_DIR="$(cd "$ROOT/.." && pwd)"
ARCHIVE="${OUT_DIR}/fleet-checklist-GITHUB-UPLOAD-${STAMP}.tar.gz"

cd "$ROOT"

tar -czvf "$ARCHIVE" \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='dist-ssr' \
  --exclude='.git' \
  --exclude='.vite' \
  --exclude='coverage' \
  --exclude='.DS_Store' \
  --exclude='*.log' \
  --exclude='.env' \
  --exclude='.env.local' \
  -C "$ROOT" .

echo ""
echo "Created: $ARCHIVE"
echo "Upload this one file to GitHub (Release attachment) or extract and push with git."
echo "After extract: cd fleet-checklist && npm install"
