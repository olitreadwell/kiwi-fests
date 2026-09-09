import { describe, expect, it } from 'vitest';
import seedData from '@/data/seed/festivals-seed.json';
import { slugify } from '@/lib/format';

const KNOWN_STATUSES = ['active', 'tbc', 'hiatus', 'defunct', 'unconfirmed'];

describe('src/data/seed/festivals-seed.json', () => {
  it('has at least one festival entry', () => {
    expect(seedData.festivals.length).toBeGreaterThan(0);
  });

  it.each(seedData.festivals.map((f) => [f.name, f] as const))(
    '%s has a non-empty name',
    (_name, festival) => {
      expect(festival.name.trim().length).toBeGreaterThan(0);
    }
  );

  it.each(seedData.festivals.map((f) => [f.name, f] as const))(
    '%s has a status from the known set used by the seed',
    (_name, festival) => {
      expect(KNOWN_STATUSES).toContain(festival.status);
    }
  );

  it.each(seedData.festivals.map((f) => [f.name, f] as const))(
    '%s has a non-empty region',
    (_name, festival) => {
      expect(typeof festival.region).toBe('string');
      expect(festival.region.trim().length).toBeGreaterThan(0);
    }
  );

  it('has no case-insensitive duplicate festival names', () => {
    const seen = new Map<string, string[]>();
    for (const f of seedData.festivals) {
      const key = f.name.trim().toLowerCase();
      seen.set(key, [...(seen.get(key) ?? []), f.name]);
    }
    const duplicates = [...seen.values()].filter((names) => names.length > 1);
    expect(duplicates).toEqual([]);
  });

  it("produces no slug collisions between distinct festival names, per the seed's slug key", () => {
    const seen = new Map<string, string[]>();
    for (const f of seedData.festivals) {
      const slug = slugify(f.name);
      seen.set(slug, [...(seen.get(slug) ?? []), f.name]);
    }
    const collisions = [...seen.values()].filter((names) => names.length > 1);
    expect(collisions).toEqual([]);
  });

  it.each(seedData.festivals.map((f) => [f.name, f] as const))(
    '%s camping field is boolean or missing (null/undefined handled by seed script)',
    (_name, festival) => {
      const f = festival as Record<string, unknown>;
      if ('camping' in f && f.camping !== null) {
        expect(typeof f.camping).toBe('boolean');
      }
    }
  );

  it.each(seedData.festivals.map((f) => [f.name, f] as const))(
    '%s attendance field is a positive integer or missing',
    (_name, festival) => {
      const f = festival as Record<string, unknown>;
      if ('attendance' in f && f.attendance !== null) {
        expect(typeof f.attendance).toBe('number');
        expect(f.attendance as number).toBeGreaterThan(0);
      }
    }
  );

  it('has at least some festivals with the new detail fields populated', () => {
    const fests = seedData.festivals as Array<Record<string, unknown>>;
    const withVibe = fests.filter((f) => typeof f.vibe === 'string' && f.vibe);
    const withCamping = fests.filter((f) => typeof f.camping === 'boolean');
    const withTicketPrice = fests.filter((f) => typeof f.ticketPrice === 'string' && f.ticketPrice);
    const withAttendance = fests.filter((f) => typeof f.attendance === 'number');

    expect(withVibe.length).toBeGreaterThan(0);
    expect(withCamping.length).toBeGreaterThan(0);
    expect(withTicketPrice.length).toBeGreaterThan(0);
    expect(withAttendance.length).toBeGreaterThan(0);
  });
});
