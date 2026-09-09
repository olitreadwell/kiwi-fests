import { createHash } from 'node:crypto';
import type { CategoryCount, CityCount, DatasetExport, DatasetMeta, Item } from '@/data/schema';
import { getSiteConfig } from '@/lib/site-config';

/** License line attached to every dataset export. */
export const DATASET_LICENSE = 'Public data only. Opt-out respected — see /opt-out.';

/**
 * Filter listings to the public subset: no opt-outs, only active entries,
 * verified or not (a listing stays public while marked unverified so the
 * community can review it).
 *
 * @param items - Full listing set
 * @returns Publicly visible listings
 */
export function getPublicItems(items: Item[]): Item[] {
  return items
    .filter((item) => !item.optOut && item.active)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Content-hash a listing array into a stable version string. Two exports
 * with identical items share a version, so ETags and cache keys stay valid.
 *
 * @param items - Listings to hash
 * @returns 12-hex-char content version
 */
export function hashItemsVersion(items: Item[]): string {
  return createHash('sha1').update(JSON.stringify(items)).digest('hex').slice(0, 12);
}

/**
 * Build the versioned dataset export (JSON and CSV both derive from it).
 *
 * @param items - Full listing set
 * @param exportedAt - ISO timestamp for this export
 * @returns Public dataset export with content-hash version
 */
export function buildDatasetExport(
  items: Item[],
  exportedAt = new Date().toISOString()
): DatasetExport {
  const publicItems = getPublicItems(items);
  return {
    version: hashItemsVersion(publicItems),
    exportedAt,
    license: DATASET_LICENSE,
    items: publicItems,
  };
}

/**
 * Count listings per city, sorted by count descending then name.
 *
 * @param items - Public listings
 * @returns City counts
 */
export function countByCity(items: Item[]): CityCount[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.city, (counts.get(item.city) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

/**
 * Count listings per category, sorted by count descending then name.
 *
 * @param items - Public listings
 * @returns Category counts
 */
export function countByCategory(items: Item[]): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const category of item.categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

/**
 * List of distinct source labels across the public dataset.
 *
 * @param items - Public listings
 * @returns Sorted unique source labels
 */
export function listSourceLabels(items: Item[]): string[] {
  return [...new Set(items.map((item) => item.source.label))].sort();
}

/**
 * Build the dataset metadata block served at /api/v1/dataset/meta.
 *
 * @param dataset - A built dataset export
 * @returns Dataset metadata
 */
export function buildDatasetMeta(dataset: DatasetExport): DatasetMeta {
  return {
    version: dataset.version,
    exportedAt: dataset.exportedAt,
    itemCount: dataset.items.length,
    cities: countByCity(dataset.items),
    categories: countByCategory(dataset.items),
    sources: listSourceLabels(dataset.items),
    license: dataset.license,
    staleAfterDays: getSiteConfig().staleAfterDays,
  };
}
