import { describe, expect, it } from 'vitest';
import {
  getArtistBySlug,
  getFestivalBySlug,
  getPromoterBySlug,
  listAllFestivals,
  listArtists,
  listCoArtists,
  listFestivals,
  listMapFestivals,
  listPromoters,
  listRegionFestivals,
  listRegions,
} from '@/lib/festival-data';

describe('festival data layer', () => {
  it('lists every festival from the dataset', () => {
    const festivals = listAllFestivals();
    expect(festivals.length).toBeGreaterThan(50);
    expect(festivals[0]).toMatchObject({
      name: expect.any(String),
      slug: expect.any(String),
      status: expect.any(String),
    });
  });

  it('filters festivals by region, status, genre, camping and search', () => {
    const byRegion = listFestivals({ region: 'GISBORNE' });
    expect(byRegion.every((f) => f.region === 'GISBORNE')).toBe(true);

    const byStatus = listFestivals({ status: 'ACTIVE' });
    expect(byStatus.every((f) => f.status === 'ACTIVE')).toBe(true);

    const byGenre = listFestivals({ genre: 'jazz' });
    expect(byGenre.length).toBeGreaterThan(0);

    const byCamping = listFestivals({ camping: 'yes' });
    expect(byCamping.every((f) => f.camping === true)).toBe(true);

    const bySearch = listFestivals({ search: 'rhythm' });
    expect(bySearch.some((f) => f.name.toLowerCase().includes('rhythm'))).toBe(true);
  });

  it('resolves a festival by slug with lineups attached', () => {
    const festival = getFestivalBySlug('rhythm-and-vines');
    expect(festival).not.toBeNull();
    expect(festival?.name).toBe('Rhythm and Vines');
    expect(Array.isArray(festival?.lineups)).toBe(true);
  });

  it('returns null for an unknown festival slug', () => {
    expect(getFestivalBySlug('not-a-festival')).toBeNull();
  });

  it('lists artists sorted by name', () => {
    const artists = listArtists();
    expect(artists.length).toBeGreaterThan(100);
    const names = artists.map((a) => a.name);
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
  });

  it('resolves an artist by slug with appearances', () => {
    const artist = getArtistBySlug('alison-wonderland');
    expect(artist).not.toBeNull();
    expect(artist?.name).toBe('Alison Wonderland');
    expect(Array.isArray(artist?.appearances)).toBe(true);
  });

  it('returns null for an unknown artist slug', () => {
    expect(getArtistBySlug('not-an-artist')).toBeNull();
  });

  it('lists promoters with festival counts', () => {
    const promoters = listPromoters();
    expect(promoters.length).toBeGreaterThan(20);
    expect(promoters[0]).toHaveProperty('festivalCount');
  });

  it('resolves a promoter by slug with festivals', () => {
    const promoter = getPromoterBySlug('venom-events');
    expect(promoter).not.toBeNull();
    expect(promoter?.name).toBe('Venom Events');
    expect(Array.isArray(promoter?.festivals)).toBe(true);
  });

  it('returns null for an unknown promoter slug', () => {
    expect(getPromoterBySlug('not-a-promoter')).toBeNull();
  });

  it('lists regions with counts', () => {
    const regions = listRegions();
    expect(regions.length).toBeGreaterThan(10);
    expect(regions[0]).toHaveProperty('count');
  });

  it('lists festivals in one region', () => {
    const festivals = listRegionFestivals('GISBORNE');
    expect(festivals.every((f) => f.region === 'GISBORNE')).toBe(true);
  });

  it('lists festivals with coordinates for the map', () => {
    const festivals = listMapFestivals();
    expect(festivals.every((f) => f.latitude !== null && f.longitude !== null)).toBe(true);
  });

  it('lists co-artists who shared a festival', () => {
    const coArtists = listCoArtists('Alison Wonderland');
    expect(Array.isArray(coArtists)).toBe(true);
  });
});
