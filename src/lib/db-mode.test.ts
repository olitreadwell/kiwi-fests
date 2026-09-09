import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { seedItems } from '@/data/items';

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('pg', () => ({
  Pool: class {
    query = mocks.query;
  },
}));

// Imports must happen after the pg mock is registered.
import {
  buildExportFromSource,
  countItems,
  getPool,
  hasDatabase,
  insertScrapeLogs,
  upsertItemsToDb,
} from '@/lib/db';
import {
  getItemById,
  listCategories,
  listCities,
  listItems,
  listSources,
  recordItemView,
  recordSearch,
  setItemOptOut,
} from '@/lib/item-repository';

describe('item repository (db mode)', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgres://localhost:5432/test';
    mocks.query.mockReset();
  });
  afterEach(() => {
    delete process.env.DATABASE_URL;
  });

  it('detects db mode and returns a pool', () => {
    expect(hasDatabase()).toBe(true);
    expect(getPool()).not.toBeNull();
  });

  it('lists items from the database without filters', async () => {
    mocks.query.mockResolvedValue({ rows: [{ data: seedItems[0] }] });
    const items = await listItems({});
    expect(items).toEqual([seedItems[0]]);
    expect(mocks.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT data FROM items'),
      expect.any(Array)
    );
  });

  it('builds city, category and source lists from db rows', async () => {
    mocks.query.mockResolvedValue({ rows: seedItems.map((item) => ({ data: item })) });
    const [cities, categories, sources] = await Promise.all([
      listCities(),
      listCategories(),
      listSources(),
    ]);
    expect(cities.length).toBeGreaterThan(0);
    expect(categories.some((c) => c.category === 'festival')).toBe(true);
    expect(sources).toContain('Aotearoa Festivals seed data');
  });

  it('fetches one item and misses unknown ones', async () => {
    mocks.query.mockResolvedValueOnce({ rows: [{ data: seedItems[0] }] });
    expect(await getItemById(seedItems[0].id)).toEqual(seedItems[0]);
    mocks.query.mockResolvedValueOnce({ rows: [] });
    expect(await getItemById('missing')).toBeNull();
  });

  it('counts filtered items', async () => {
    mocks.query.mockResolvedValue({ rows: [{ total: 7 }] });
    expect(
      await countItems({ city: 'Gisborne', category: 'festival', q: 'rhythm' })
    ).toBeGreaterThan(0);
  });

  it('builds the dataset export from the database', async () => {
    mocks.query.mockResolvedValue({ rows: seedItems.map((item) => ({ data: item })) });
    const dataset = await buildExportFromSource();
    expect(dataset.items.length).toBe(seedItems.length);
    expect(dataset.version.length).toBe(12);
  });

  it('upserts items and logs scrape runs', async () => {
    mocks.query.mockResolvedValue({ rows: [] });
    await upsertItemsToDb(seedItems);
    expect(mocks.query).toHaveBeenCalledTimes(seedItems.length);
    mocks.query.mockClear();
    await insertScrapeLogs([{ source: 'x', status: 'ok', itemsFound: 1, itemsNew: 1 }]);
    expect(mocks.query).toHaveBeenCalledTimes(1);
  });

  it('records analytics and opt-outs against the database', async () => {
    mocks.query.mockResolvedValue({ rows: [] });
    await recordItemView(seedItems[0].id);
    await recordSearch('query', 3);
    expect(mocks.query).toHaveBeenCalledTimes(2);

    mocks.query.mockResolvedValueOnce({ rowCount: 1 });
    expect(await setItemOptOut(seedItems[0].id)).toBe(true);
    mocks.query.mockResolvedValueOnce({ rowCount: 0 });
    expect(await setItemOptOut('other')).toBe(false);
  });
});
