import type { Item } from '@/data/schema';
import { countItems as countItemsFromDb, readSnapshotItems, hasDatabase, getPool } from '@/lib/db';
import { countByCategory, countByCity, listSourceLabels } from '@/lib/dataset';
import { searchItems } from '@/lib/search';

/** How many recent items list endpoints return when no limit is given. */
export const DEFAULT_ITEM_LIMIT = 50;

/** Maximum items a list endpoint will return in one page. */
export const MAX_ITEM_LIMIT = 200;

/**
 * List all public listings, optionally filtered by city, category and
 * free-text query, with pagination.
 *
 * @param options - Filter and pagination options
 * @returns Public listings in display order
 */
export async function listItems(
  options: {
    q?: string;
    city?: string;
    category?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<Item[]> {
  if (hasDatabase()) {
    return listItemsFromDb(options);
  }
  let items = searchItems(readSnapshotItems(), options.q ?? '');
  if (options.city) items = items.filter((item) => item.city === options.city);
  if (options.category)
    items = items.filter((item) => item.categories.includes(options.category ?? ''));
  const limit = Math.min(options.limit ?? DEFAULT_ITEM_LIMIT, MAX_ITEM_LIMIT);
  return items.slice(options.offset ?? 0, (options.offset ?? 0) + limit);
}

/**
 * Count public listings matching filters, for response meta blocks.
 *
 * @param options - Filter options
 * @returns Matching item count
 */
export async function countItems(
  options: { q?: string; city?: string; category?: string } = {}
): Promise<number> {
  return countItemsFromDb(options);
}

/**
 * Fetch one public listing by id.
 *
 * @param id - Listing id (URL slug)
 * @returns The listing, or null when unknown or not public
 */
export async function getItemById(id: string): Promise<Item | null> {
  if (hasDatabase()) {
    const pool = getPool();
    if (!pool) return null;
    const result = await pool.query(
      `SELECT data FROM items WHERE id = $1 AND opt_out = FALSE AND active = TRUE`,
      [id]
    );
    return result.rows[0]?.data ?? null;
  }
  const items = readSnapshotItems();
  return items.find((item) => item.id === id && !item.optOut && item.active) ?? null;
}

/**
 * City listing with counts, for /api/v1/cities and browse pages.
 *
 * @returns Sorted city counts
 */
export async function listCities(): Promise<Array<{ city: string; count: number }>> {
  const items = await listItems({ limit: MAX_ITEM_LIMIT });
  return countByCity(items);
}

/**
 * Category listing with counts, for /api/v1/categories.
 *
 * @returns Sorted category counts
 */
export async function listCategories(): Promise<Array<{ category: string; count: number }>> {
  const items = await listItems({ limit: MAX_ITEM_LIMIT });
  return countByCategory(items);
}

/**
 * Distinct source labels across the public dataset.
 *
 * @returns Sorted source labels
 */
export async function listSources(): Promise<string[]> {
  const items = await listItems({ limit: MAX_ITEM_LIMIT });
  return listSourceLabels(items);
}

/**
 * Record a profile view. DB mode stores it in analytics.item_views for the
 * self-improvement loop; snapshot mode logs to stdout only.
 *
 * @param id - Listing id that was viewed
 */
export async function recordItemView(id: string): Promise<void> {
  if (!hasDatabase()) {
    console.log(`analytics:item_view id=${id}`);
    return;
  }
  const pool = getPool();
  if (!pool) return;
  await pool.query(`INSERT INTO analytics (event_type, item_id) VALUES ('item_view', $1)`, [id]);
}

/**
 * Record a search query. DB mode stores it for the self-improvement loop;
 * snapshot mode logs to stdout only.
 *
 * @param query - Search text
 * @param resultCount - Number of results returned
 */
export async function recordSearch(query: string, resultCount: number): Promise<void> {
  if (!hasDatabase()) {
    console.log(`analytics:search query=${query} results=${resultCount}`);
    return;
  }
  const pool = getPool();
  if (!pool) return;
  await pool.query(`INSERT INTO analytics (event_type, payload) VALUES ('search', $1)`, [
    JSON.stringify({ query, resultCount }),
  ]);
}

/**
 * Mark a listing as opted out. DB mode persists the flag immediately;
 * snapshot mode cannot mutate the committed file from a serverless
 * function, so it logs the intent (the opt-out page explains this).
 *
 * @param id - Listing id being removed
 * @returns True when the listing existed and was public
 */
export async function setItemOptOut(id: string): Promise<boolean> {
  if (!hasDatabase()) {
    console.log(`opt-out requested for ${id} (snapshot mode — needs a PR)`);
    return Boolean(
      readSnapshotItems().find((item) => item.id === id && !item.optOut && item.active)
    );
  }
  const pool = getPool();
  if (!pool) return false;
  const result = await pool.query(`UPDATE items SET opt_out = TRUE WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Read listings from Postgres. Items are stored as a JSONB `data` column so
 * schema evolution never requires a migration per field.
 *
 * @param options - Filter and pagination options
 * @returns Public listings in display order
 */
export async function listItemsFromDb(
  options: { q?: string; city?: string; category?: string; limit?: number; offset?: number } = {}
): Promise<Item[]> {
  const pool = getPool();
  if (!pool) return [];
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
  const limit = Math.min(options.limit ?? DEFAULT_ITEM_LIMIT, MAX_ITEM_LIMIT);
  params.push(limit);
  const offset = options.offset ?? 0;
  params.push(offset);
  const result = await pool.query(
    `SELECT data FROM items
     WHERE ${clauses.join(' AND ')}
     ORDER BY data->>'name' ASC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return result.rows.map((row) => row.data as Item);
}
