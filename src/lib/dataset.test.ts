import { describe, expect, it } from 'vitest';
import type { Item } from '@/data/schema';
import { seedItems } from '@/data/items';
import {
  buildDatasetExport,
  buildDatasetMeta,
  countByCategory,
  countByCity,
  getPublicItems,
  hashItemsVersion,
  listSourceLabels,
} from '@/lib/dataset';

describe('dataset export helpers', () => {
  it('filters opt-outs and inactive items and sorts by name', () => {
    const items: Item[] = [
      { ...seedItems[0], name: 'Zed' },
      { ...seedItems[0], name: 'Alpha', optOut: true },
      { ...seedItems[0], name: 'Bravo', active: false },
      { ...seedItems[0], name: 'Middle' },
    ];
    expect(getPublicItems(items).map((item) => item.name)).toEqual(['Middle', 'Zed']);
  });

  it('builds a versioned export with a stable content hash', () => {
    const a = buildDatasetExport(seedItems, '2026-01-01T00:00:00Z');
    const b = buildDatasetExport(seedItems, '2026-01-02T00:00:00Z');
    expect(a.version).toBe(b.version);
    expect(a.exportedAt).not.toBe(b.exportedAt);
    expect(a.version).toMatch(/^[a-f0-9]{12}$/);
  });

  it('hashes different item sets differently', () => {
    const changed = [{ ...seedItems[0], description: 'changed' }, ...seedItems.slice(1)];
    expect(hashItemsVersion(seedItems)).not.toBe(hashItemsVersion(changed));
  });

  it('counts by city and category descending', () => {
    const cities = countByCity(seedItems);
    expect(cities[0].count).toBeGreaterThanOrEqual(cities[cities.length - 1].count);
    expect(cities.find((c) => c.city === 'Gisborne')?.count).toBeGreaterThan(0);
    const categories = countByCategory(seedItems);
    expect(categories.some((c) => c.category === 'festival')).toBe(true);
  });

  it('lists distinct source labels sorted', () => {
    expect(listSourceLabels(seedItems)).toContain('Aotearoa Festivals seed data');
  });

  it('builds dataset meta from an export', () => {
    const dataset = buildDatasetExport(seedItems);
    const meta = buildDatasetMeta(dataset);
    expect(meta.version).toBe(dataset.version);
    expect(meta.itemCount).toBe(seedItems.length);
    expect(meta.sources.length).toBeGreaterThan(0);
    expect(meta.staleAfterDays).toBeGreaterThan(0);
  });
});
