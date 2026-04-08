#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  export $(grep -v '^#' .env | sed -E 's/\r$//' | xargs)
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Missing DATABASE_URL. Set it in .env or export it before running this script."
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is not installed. Install the PostgreSQL client or run the SQL manually in Supabase SQL editor."
  exit 1
fi

echo "Applying schema from supabase-schema.sql to DATABASE_URL..."
psql "$DATABASE_URL" -f supabase-schema.sql

echo "Schema applied successfully."
