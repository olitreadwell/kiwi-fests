import { itemListSchema } from '@/data/schema';
import type { Item } from '@/data/schema';
import { readSnapshotItems } from '@/lib/db';
import { mergeScrapedListings } from '@/lib/scrapers/types';
import { exampleListingsScraper } from '@/lib/scrapers/example';
import type { ScrapeResult, Scraper, ScrapedListing } from '@/lib/scrapers/types';

/**
 * Ordered list of scrapers for this project. Template ships with the
 * offline example; add real scrapers targeting the project's public
 * sources and they run in order, each isolated behind try/catch.
 */
export const scrapers: Scraper[] = [exampleListingsScraper];

/**
 * Run every enabled scraper and merge results into the dataset. Each
 * scraper runs isolated: one failure never takes down the refresh cycle.
 *
 * @param options - Run options
 * @returns Per-source results plus the new item list
 */
export async function runAllScrapers(
  options: { disabledSources?: Set<string> } = {}
): Promise<{ results: ScrapeResult[]; items: Item[] }> {
  const active = scrapers.filter((scraper) => !options.disabledSources?.has(scraper.source));
  const existing = itemListSchema.parse(readSnapshotItems());
  const knownIds = new Set(existing.map((item) => item.id));
  const scrapedThisRun = new Set<string>();
  const allScraped: ScrapedListing[] = [];
  const results: ScrapeResult[] = [];
  for (const scraper of active) {
    try {
      const found = await scraper.run();
      const itemsNew = found.filter((listing) => {
        const isNew = !knownIds.has(listing.id) && !scrapedThisRun.has(listing.id);
        scrapedThisRun.add(listing.id);
        return isNew;
      }).length;
      allScraped.push(...found);
      results.push({
        source: scraper.source,
        status: 'ok',
        itemsFound: found.length,
        itemsNew,
      });
    } catch (err) {
      results.push({
        source: scraper.source,
        status: 'error',
        itemsFound: 0,
        itemsNew: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  const { items } = mergeScrapedListings(existing, allScraped);
  return { results, items: itemListSchema.parse(items) };
}
