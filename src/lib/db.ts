import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Pool } from 'pg';
import type { Item } from '@/data/schema';
import { itemListSchema } from '@/data/schema';
import { buildDatasetExport } from '@/lib/dataset';
import type { ScrapeResult } from '@/lib/scrapers/types';

let pool: Pool | null = null;
let snapshotCache: { items: Item[]; loadedAt: number } | null = null;

/** Milliseconds a snapshot file read is cached for. */
export const SNAPSHOT_CACHE_TTL_MS = 60_000;

/** Path of the committed snapshot, relative to the repo root. */
const SNAPSHOT_PATH = join(process.cwd(), 'src', 'data', 'snapshot.json');

/**
 * True when a Postgres DATABASE_URL is configured and the repository
 * should use the database instead of the committed snapshot file.
 *
 * @returns Whether DB mode is active
 */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Lazily create the shared Postgres pool. Returns null in snapshot mode,
 * i.e. when DATABASE_URL is not configured.
 *
 * @returns Pool or null
 */
export function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null;
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

/**
 * Read and validate the committed snapshot file, cached for a short TTL so
 * request-time reads stay cheap. Throws when the file is missing or fails
 * zod validation — a bad dataset must fail loudly, not serve silently.
 *
 * @returns The validated listing set from the snapshot
 */
export function readSnapshotItems(): Item[] {
  const now = Date.now();
  if (snapshotCache && now - snapshotCache.loadedAt < SNAPSHOT_CACHE_TTL_MS) {
    return snapshotCache.items;
  }
  if (!existsSync(SNAPSHOT_PATH)) {
    throw new Error(`snapshot file not found: ${SNAPSHOT_PATH} — run scripts/build-snapshot.mjs`);
  }
  const raw = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as { items: unknown };
  const items = itemListSchema.parse(raw.items);
  snapshotCache = { items, loadedAt: now };
  return items;
}

/**
 * Build the dataset export from whichever data source is active.
 *
 * @returns Versioned dataset export
 */
export async function buildExportFromSource(): Promise<ReturnType<typeof buildDatasetExport>> {
  if (!hasDatabase()) {
    return buildDatasetExport(readSnapshotItems());
  }
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL set but pool unavailable');
  const result = await pool.query(
    `SELECT data FROM items WHERE opt_out = FALSE AND active = TRUE ORDER BY name ASC`
  );
  const items = itemListSchema.parse(result.rows.map((row) => row.data));
  return buildDatasetExport(items);
}

/**
 * Invalidate the snapshot cache (used after a scrape regenerates the file).
 */
export function resetSnapshotCache(): void {
  snapshotCache = null;
}

/**
 * Upsert items into Postgres, replacing any row with the same id. Used by
 * the cron refresh and run-scrapers in DB mode.
 *
 * @param items - Items to persist
 */
export async function upsertItemsToDb(items: Item[]): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  for (const item of items) {
    await pool.query(
      `INSERT INTO items (id, data, last_verified)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE
         SET data = EXCLUDED.data, last_verified = EXCLUDED.last_verified, updated_at = now()`,
      [item.id, item, item.lastVerified]
    );
  }
}

/**
 * Persist one run's scrape results into the scrapes table (DB mode).
 *
 * @param results - Per-source scrape outcomes
 */
export async function insertScrapeLogs(results: ScrapeResult[]): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  for (const result of results) {
    await pool.query(
      `INSERT INTO scrapes (source, status, items_found, items_new, error, started_at, finished_at)
       VALUES ($1, $2, $3, $4, $5, now(), now())`,
      [result.source, result.status, result.itemsFound, result.itemsNew, result.error ?? null]
    );
  }
}

/**
 * Count items matching the given filters, ignoring pagination.
 *
 * @param options - Filter options
 * @returns Matching item count
 */
export async function countItems(
  options: { q?: string; city?: string; category?: string } = {}
): Promise<number> {
  if (!hasDatabase()) {
    let items = readSnapshotItems();
    if (options.q)
      items = items.filter((item) =>
        item.name.toLowerCase().includes((options.q ?? '').toLowerCase())
      );
    if (options.city) items = items.filter((item) => item.city === options.city);
    if (options.category)
      items = items.filter((item) => item.categories.includes(options.category ?? ''));
    return items.filter((item) => !item.optOut && item.active).length;
  }
  const pool = getPool();
  if (!pool) return 0;
  const clauses = [`opt_out = FALSE`, `active = TRUE`];
  const params: unknown[] = [];
  if (options.city) {
    params.push(options.city);
    clauses.push(`data->>'city' = $${params.length}`);
  }
  if (options.category) {
    params.push(options.category);
    clauses.push(`data->'categories' ? $${params.length}`);
  }
  if (options.q) {
    params.push(`%${options.q}%`);
    clauses.push(
      `(data->>'name' ILIKE $${params.length} OR data->>'description' ILIKE $${params.length})`
    );
  }
  const result = await pool.query(
    `SELECT count(*)::int AS total FROM items WHERE ${clauses.join(' AND ')}`,
    params
  );
  return result.rows[0].total as number;
}
