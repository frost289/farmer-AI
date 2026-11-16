#!/usr/bin/env sh
# One-time local setup (no Docker): installs dependencies and creates .env files.
set -e
cd "$(dirname "$0")/.."

copy_env() { [ -f "$1/.env" ] || { cp "$1/.env.example" "$1/.env" && echo "created $1/.env"; }; }

echo "== api =="; (cd api && npm install); copy_env api
echo "== web =="; (cd web && npm install); copy_env web
for svc in advisory vision; do
  echo "== ai-services/$svc =="
  (cd "ai-services/$svc" && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt)
  copy_env "ai-services/$svc"
done
sh scripts/sync-taxonomy.sh

cat <<MSG

Done. Next:
  1. Create the database:  createdb farmai_dev   (edit api/.env DATABASE_URL if needed)
  2. sh scripts/migrate.sh && sh scripts/seed.sh
  3. Start each service (see README.md "Run locally").
MSG
