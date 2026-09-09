import { describe, expect, it } from 'vitest';
import { findNewCandidates, promoteCandidates, verifyCandidate } from '@/lib/scrapers/discover';
import type { ScrapedListing } from '@/lib/scrapers/types';

function listing(overrides: Partial<ScrapedListing> = {}): ScrapedListing {
  return {
    id: 'salvation-army',
    name: 'Salvation Army',
    city: 'Wellington',
    region: 'Wellington region',
    website: 'https://example.com',
    source: { label: 'test', url: 'https://example.com' },
    foundAt: '2026-08-01',
    ...overrides,
  };
}

describe('candidate discovery → verification → promotion', () => {
  it('finds candidates not already in the dataset', () => {
    const newCandidates = findNewCandidates(new Set(['existing']), [
      listing({ id: 'existing' }),
      listing({ id: 'fresh' }),
    ]);
    expect(newCandidates.map((c) => c.id)).toEqual(['fresh']);
  });

  it('verifies slugs, names, cities and regions', () => {
    expect(verifyCandidate(listing())).toBeNull();
    expect(verifyCandidate(listing({ id: 'wrong-slug' }))).toContain('slug mismatch');
    expect(verifyCandidate(listing({ name: '' }))).toBe('missing name');
    expect(verifyCandidate(listing({ city: ' ' }))).toContain('missing city');
    expect(verifyCandidate(listing({ region: ' ' }))).toContain('missing region');
  });

  it('promotes only clean candidates and reports skipped ones', () => {
    const { promotable, skipped } = promoteCandidates([
      listing(),
      listing({ id: 'bad-slug-name' }),
    ]);
    expect(promotable.length).toBe(1);
    expect(skipped.length).toBe(1);
    expect(skipped[0].reason).toContain('slug');
  });
});
