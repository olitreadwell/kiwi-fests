import type { Item } from '@/data/schema';

/**
 * One raw listing found by a scraper, before verification and promotion.
 * Deliberately looser than the item schema: scrapers fill in what they can
 * and verification completes the rest.
 */
export interface ScrapedListing {
  /** Candidate id, usually the slugified name. */
  id: string;
  /** Display name. */
  name: string;
  /** City the listing sits in. */
  city: string;
  /** Region label, e.g. "Wellington region". */
  region: string;
  /** Suburb or area. */
  location?: string;
  /** Latitude, if the source provides it. */
  lat?: number;
  /** Longitude, if the source provides it. */
  lng?: number;
  /** Public website or listing page URL. */
  website?: string;
  /** Category labels. */
  categories?: string[];
  /** Short description. */
  description?: string;
  /** Where this candidate was found. */
  source: { label: string; url: string };
  /** ISO date the candidate was seen. */
  foundAt: string;
}

/** Outcome of one scraper run, recorded in the scrapes log. */
export interface ScrapeResult {
  /** Source id, e.g. "example-listings". */
  source: string;
  /** ok or error. Errors never crash the refresh cycle. */
  status: 'ok' | 'error';
  /** Candidates found this run. */
  itemsFound: number;
  /** Candidates new to the dataset this run. */
  itemsNew: number;
  /** Error message when status is error. */
  error?: string;
}

/** A scraper: fetches one public source and returns raw listings. */
export interface Scraper {
  /** Source id used in scrapes logs and DATA_SOURCES.md. */
  source: string;
  /** Run one fetch + parse pass over the source. */
  run(): Promise<ScrapedListing[]>;
}

/**
 * Merge scraped listings into the existing dataset. Listings whose id
 * already exists are skipped (existing data wins, so curated fixes are not
 * overwritten by scrapers).
 *
 * @param existing - Current validated items
 * @param scraped - Raw listings from a scraper run
 * @returns The merged item list plus how many were new
 */
export function mergeScrapedListings(
  existing: Item[],
  scraped: ScrapedListing[]
): { items: Item[]; newIds: string[] } {
  const knownIds = new Set(existing.map((item) => item.id));
  const newIds: string[] = [];
  const additions: Item[] = scraped
    .filter((candidate) => !knownIds.has(candidate.id))
    .map((candidate) => {
      newIds.push(candidate.id);
      return {
        id: candidate.id,
        slug: candidate.id,
        name: candidate.name,
        city: candidate.city,
        region: candidate.region,
        location: candidate.location,
        lat: candidate.lat,
        lng: candidate.lng,
        categories: candidate.categories ?? [],
        description: candidate.description,
        website: candidate.website,
        source: { label: candidate.source.label, url: candidate.source.url },
        lastVerified: candidate.foundAt,
        verified: false,
        active: true,
        optOut: false,
        calendarDates: [],
      };
    });
  return { items: [...existing, ...additions], newIds };
}
