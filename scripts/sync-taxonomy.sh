#!/usr/bin/env sh
# Copies docs/label-taxonomy.json into each AI service. Run after editing the taxonomy.
set -e
cd "$(dirname "$0")/.."
for svc in advisory vision; do
  cp docs/label-taxonomy.json "ai-services/$svc/app/taxonomy.json"
  echo "synced ai-services/$svc"
done
