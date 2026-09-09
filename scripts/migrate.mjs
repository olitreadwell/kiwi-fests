// DB mode: creates the generic dataset schema in Postgres.
// Usage: DATABASE_URL=postgres://... node scripts/migrate.mjs
import pg from 'pg';

const { Pool } = pg;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  last_verified TEXT,
  opt_out BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scrapes (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  items_found INTEGER NOT NULL DEFAULT 0,
  items_new INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidates (
  id BIGSERIAL PRIMARY KEY,
  item_id TEXT,
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'new',
  details JSONB NOT NULL DEFAULT '{}',
  found_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  item_id TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required (put it in .env.local).');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
await pool.query(SCHEMA);
console.log('Schema ready: items, scrapes, candidates, analytics.');
await pool.end();
