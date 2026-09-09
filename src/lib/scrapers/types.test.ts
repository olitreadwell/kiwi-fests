import { describe, expect, it } from 'vitest';
import { seedItems } from '@/data/items';
import { mergeScrapedListings } from '@/lib/scrapers/types';
import type { ScrapedListing } from '@/lib/scrapers/types';

const scraped: ScrapedListing = {
  id: 'brand-new-shop',
  name: 'Brand New Shop',
  city: 'Wellington',
  region: 'Wellington region',
  website: 'https://example.com/brand-new',
  categories: ['thrift'],
  source: { label: 'source-x', url: 'https://example.com/source' },
  foundAt: '2026-08-29',
};

describe('mergeScrapedListings', () => {
  it('keeps existing data and adds new ids', () => {
    const duplicate = { ...scraped, id: seedItems[0].id, name: 'Overwritten Name' };
    const { items, newIds } = mergeScrapedListings(seedItems, [duplicate, scraped]);
    expect(newIds).toEqual([scraped.id]);
    expect(items.length).toBe(seedItems.length + 1);
    const kept = items.find((item) => item.id === seedItems[0].id);
    expect(kept?.name).toBe(seedItems[0].name);
  });

  it('fills schema defaults on promoted listings', () => {
    const { items } = mergeScrapedListings(seedItems, [scraped]);
    const added = items.find((item) => item.id === scraped.id);
    expect(added?.active).toBe(true);
    expect(added?.optOut).toBe(false);
    expect(added?.verified).toBe(false);
    expect(added?.calendarDates).toEqual([]);
  });
});
