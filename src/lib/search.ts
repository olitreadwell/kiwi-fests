import Fuse from 'fuse.js';
import type { Item } from '@/data/schema';
import { getPublicItems } from '@/lib/dataset';

/** Weights for fuzzy search across listing fields. */
const SEARCH_KEYS: Array<{ name: string; weight: number }> = [
  { name: 'name', weight: 0.5 },
  { name: 'description', weight: 0.2 },
  { name: 'categories', weight: 0.15 },
  { name: 'city', weight: 0.1 },
  { name: 'location', weight: 0.05 },
];

/** Shared Fuse options so every entry point scores the same. */
const FUSE_OPTIONS = {
  keys: SEARCH_KEYS,
  threshold: 0.35,
  ignoreLocation: true,
} as const;

/**
 * Fuzzy-search listings across name, description, categories, city and
 * location. Returns public items ranked by relevance.
 *
 * @param items - Full listing set
 * @param query - Free-text query
 * @returns Matched public items, best match first
 */
export function searchItems(items: Item[], query: string): Item[] {
  const publicItems = getPublicItems(items);
  const trimmed = query.trim();
  if (!trimmed) return publicItems;
  const fuse = new Fuse(publicItems, FUSE_OPTIONS);
  return fuse.search(trimmed).map((result) => result.item);
}
