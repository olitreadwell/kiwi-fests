import { afterEach, describe, expect, it, vi } from 'vitest';
import { readSnapshotItems, resetSnapshotCache } from '@/lib/db';
import { exampleListingsScraper } from '@/lib/scrapers/example';
import { runAllScrapers } from '@/lib/scrapers/run-all';

describe('runAllScrapers', () => {
  afterEach(() => {
    resetSnapshotCache();
    vi.restoreAllMocks();
  });

  it('runs the example scraper and reports results', async () => {
    const { results, items } = await runAllScrapers();
    const example = results.find((result) => result.source === 'example-listings');
    expect(example?.status).toBe('ok');
    expect(example?.itemsNew).toBeGreaterThan(0);
    expect(items.length).toBeGreaterThan(readSnapshotItems().length);
  });

  it('skips disabled sources', async () => {
    const { results } = await runAllScrapers({
      disabledSources: new Set(['example-listings']),
    });
    expect(results.find((result) => result.source === 'example-listings')).toBeUndefined();
  });

  it('isolates scraper errors', async () => {
    vi.spyOn(exampleListingsScraper, 'run').mockRejectedValueOnce(new Error('source down'));
    const { results, items } = await runAllScrapers();
    expect(results[0].status).toBe('error');
    expect(results[0].error).toContain('source down');
    expect(items).toBeDefined();
  });
});
