import type { Item } from '@/data/schema';
import { getSiteConfig } from '@/lib/site-config';

/**
 * True when a listing's lastVerified date is older than the site's
 * staleness window. Stale listings stay public but get a warning badge and
 * a community "fix this listing" prompt.
 *
 * @param item - Listing to check
 * @param today - Reference date, injectable for tests
 * @returns True when the listing is stale
 */
export function isStale(item: Item, today = new Date()): boolean {
  const verified = new Date(`${item.lastVerified}T00:00:00Z`);
  const cutoff = new Date(today);
  cutoff.setUTCDate(cutoff.getUTCDate() - getSiteConfig().staleAfterDays);
  return verified < cutoff;
}
