import { describe, expect, it } from 'vitest';
import type { Item } from '@/data/schema';
import { seedItems } from '@/data/items';
import { isStale } from '@/lib/stale';

function makeItem(overrides: Partial<Item>): Item {
  return { ...seedItems[0], lastVerified: '2026-08-01', ...overrides };
}

describe('isStale', () => {
  const today = new Date('2026-08-29T00:00:00Z');

  it('flags listings older than the staleness window', () => {
    expect(isStale(makeItem({ lastVerified: '2025-01-15' }), today)).toBe(true);
  });

  it('keeps recently verified listings fresh', () => {
    expect(isStale(makeItem({ lastVerified: '2026-08-01' }), today)).toBe(false);
  });

  it('treats today as fresh', () => {
    expect(isStale(makeItem({ lastVerified: '2026-08-29' }), today)).toBe(false);
  });
});
