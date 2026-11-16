#!/usr/bin/env sh
# Applies api/db/migrations/*.sql in order (tracked in schema_migrations).
set -e
cd "$(dirname "$0")/../api"
npm run migrate
