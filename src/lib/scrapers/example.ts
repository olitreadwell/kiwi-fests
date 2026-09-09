import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { toSlug } from '@/lib/slug';
import type { Scraper, ScrapedListing } from '@/lib/scrapers/types';

/**
 * Example scraper shipping with the template. It reads a committed sample
 * listing file so the whole pipeline runs offline and end-to-end; projects
 * replace it with real scrapers targeting their own public sources (see
 * src/lib/scrapers/* and DATA_SOURCES.md).
 */
export const exampleListingsScraper: Scraper = {
  source: 'example-listings',
  run: async () => {
    const file = join(process.cwd(), 'scripts', 'examples', 'listing-entries.json');
    const entries = JSON.parse(readFileSync(file, 'utf8')) as Array<Record<string, string>>;
    const today = new Date().toISOString().slice(0, 10);
    return entries.map((entry) => {
      const name = entry.name ?? '';
      const listings: ScrapedListing = {
        id: toSlug(name),
        name,
        city: entry.city ?? 'Wellington',
        region: entry.region ?? 'Wellington region',
        location: entry.location,
        website: entry.website,
        categories: entry.categories ? entry.categories.split(',') : [],
        description: entry.description,
        source: { label: 'Example listings file', url: entry.website ?? 'https://example.com' },
        foundAt: today,
      };
      return listings;
    });
  },
};
