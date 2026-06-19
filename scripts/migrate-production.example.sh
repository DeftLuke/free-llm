#!/bin/bash
# Example: copy local SQLite + encryption key to a production server.
# NEVER commit real ENCRYPTION_KEY values or database dumps to git.
set -euo pipefail

APP=/home/youruser/apps/free-llm
DB_SRC="${1:-$APP/freeapi.db}"
PUBLIC_URL="${PUBLIC_URL:-https://llm.example.com}"

if [[ ! -f "$DB_SRC" ]]; then
  echo "Usage: migrate-production.sh [path/to/freeapi.db]"
  exit 1
fi

cd "$APP"

cat > .env << EOF
ENCRYPTION_KEY=REPLACE_WITH_64_CHAR_HEX_FROM_openssl_rand_hex_32
PORT=3001
HOST_BIND=127.0.0.1
NODE_ENV=production
DASHBOARD_ORIGINS=${PUBLIC_URL}
EOF
chmod 600 .env

docker compose stop freellmapi || true
docker run --rm \
  -v free-llm-data:/data \
  -v "$DB_SRC:/src/freeapi.db:ro" \
  alpine:3.20 sh -c 'cp /src/freeapi.db /data/freeapi.db && chown 1000:1000 /data/freeapi.db'

docker compose up -d freellmapi
curl -sf http://127.0.0.1:3001/api/ping && echo " OK"
