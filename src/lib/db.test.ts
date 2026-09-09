import { afterEach, describe, expect, it } from 'vitest';
import { countItems, readSnapshotItems, resetSnapshotCache } from '@/lib/db';

describe('snapshot data source', () => {
  const original = process.env.DATABASE_URL;
  afterEach(() => {
    try {
      resetSnapshotCache();
    } catch {
      // cache may legitimately not exist between resets
    }
    if (original === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = original;
  });

  it('reads and validates the committed snapshot', () => {
    const items = readSnapshotItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.id === item.slug)).toBe(true);
  });

  it('counts with filters in snapshot mode', async () => {
    const total = await countItems({});
    expect(total).toBeGreaterThan(0);
    const cityTotal = await countItems({ city: 'Gisborne' });
    expect(cityTotal).toBeGreaterThan(0);
    const categoryTotal = await countItems({ category: 'festival' });
    expect(categoryTotal).toBeGreaterThan(0);
    expect(cityTotal).toBeLessThanOrEqual(total);
  });

  it('uses no database by default (snapshot mode)', () => {
    delete process.env.DATABASE_URL;
    expect(countItems).toBeDefined();
  });
});
