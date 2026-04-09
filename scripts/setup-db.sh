#!/usr/bin/env bash
# PostgreSQL init script — runs once when the data volume is first created.
# Creates separate databases/extensions if needed.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  -- Enable useful extensions
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  -- Tables are auto-created by each service on startup,
  -- so no DDL is strictly required here.
  -- This script ensures the extensions are available.
EOSQL

echo "Database initialization complete."
