import { afterEach, describe, expect, it } from 'vitest';
import { getSiteConfig } from '@/lib/site-config';

describe('site-config', () => {
  const originalUrl = process.env.NEXT_PUBLIC_SITE_URL;
  afterEach(() => {
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = originalUrl;
  });

  it('exposes every key the site, feeds and API read', () => {
    const config = getSiteConfig();
    expect(config.name.length).toBeGreaterThan(0);
    expect(config.thing.length).toBeGreaterThan(0);
    expect(config.thingPlural.length).toBeGreaterThan(0);
    expect(config.city.length).toBeGreaterThan(0);
    expect(config.region.length).toBeGreaterThan(0);
    expect(config.staleAfterDays).toBeGreaterThan(0);
    expect(config.refreshSchedule).toMatch(/^(\d+|\*)/);
  });

  it('applies the NEXT_PUBLIC_SITE_URL override', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.nz';
    expect(getSiteConfig().baseUrl).toBe('https://example.nz');
  });

  it('falls back to the committed base url when unset', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(typeof getSiteConfig().baseUrl).toBe('string');
  });
});
