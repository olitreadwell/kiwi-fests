import { seedItems } from '@/data/items';
import { artists as artistList } from '@/data/artists';
import { promoters as promoterList } from '@/data/promoters';
import { lineups as lineupList } from '@/data/lineups';
import { slugify } from '@/lib/format';
import type {
  Artist,
  Festival,
  FestivalStatus,
  LineupEntry,
  Promoter,
  Region,
} from '@/lib/festival-types';

/** Map seed status labels to the domain enum keys. */
const STATUS_TO_KEY: Record<string, FestivalStatus> = {
  active: 'ACTIVE',
  tbc: 'TBC',
  hiatus: 'HIATUS',
  defunct: 'DEFUNCT',
  unconfirmed: 'UNCONFIRMED',
};

/** Map seed region labels to the domain enum keys. */
const REGION_TO_KEY: Record<string, Region> = {
  Northland: 'NORTHLAND',
  Auckland: 'AUCKLAND',
  Waikato: 'WAIKATO',
  'Bay of Plenty': 'BAY_OF_PLENTY',
  Gisborne: 'GISBORNE',
  "Hawke's Bay": 'HAWKES_BAY',
  Taranaki: 'TARANAKI',
  'Manawatū-Whanganui': 'MANAWATU_WHANGANUI',
  Wellington: 'WELLINGTON',
  Wairarapa: 'WAIRARAPA',
  Tasman: 'TASMAN',
  Nelson: 'NELSON',
  Marlborough: 'MARLBOROUGH',
  'West Coast': 'WEST_COAST',
  Canterbury: 'CANTERBURY',
  Otago: 'OTAGO',
  Southland: 'SOUTHLAND',
  Online: 'ONLINE',
};

/** Map a dataset item to the domain Festival shape the pages read. */
function toFestival(item: (typeof seedItems)[number]): Festival {
  const f = item.festival;
  const promoter = f?.promoter ? (promoterList.find((p) => p.name === f.promoter) ?? null) : null;
  const promoterView: Promoter | null = promoter
    ? {
        id: promoter.id,
        name: promoter.name,
        region: promoter.region ?? null,
        genre: promoter.genre ?? null,
        instagram: promoter.instagram ?? null,
        facebook: promoter.facebook ?? null,
        website: promoter.website ?? null,
        notes: promoter.notes ?? null,
      }
    : null;
  const start = item.calendarDates[0]?.start
    ? new Date(`${item.calendarDates[0].start}T00:00:00Z`)
    : null;
  const end = item.calendarDates[0]?.end
    ? new Date(`${item.calendarDates[0].end}T00:00:00Z`)
    : null;
  return {
    id: item.id,
    name: item.name,
    slug: item.id,
    status: (STATUS_TO_KEY[f?.status ?? 'active'] ?? 'ACTIVE') as FestivalStatus,
    region: (item.region === 'New Zealand' ? null : (REGION_TO_KEY[item.region] ?? null)) ?? null,
    location: item.location ?? null,
    genre: f?.genre ?? null,
    costText: f?.cost ?? null,
    dateText: item.calendarDates[0]?.label ?? null,
    startDate: start,
    endDate: end,
    notes: item.description ?? null,
    website: item.website ?? null,
    approved: true,
    vibe: f?.vibe ?? null,
    camping: f?.camping ?? null,
    ticketPrice: f?.ticketPrice ?? null,
    ticketUrl: f?.ticketUrl ?? null,
    attendance: f?.attendance ?? null,
    latitude: item.lat ?? null,
    longitude: item.lng ?? null,
    promoterId: promoter?.id ?? null,
    promoter: promoterView,
  };
}

/** All festivals, mapped from the dataset. */
export function listAllFestivals(): Festival[] {
  return seedItems.map(toFestival);
}

/**
 * List festivals with the same filters the home dashboard exposes.
 *
 * @param filters - Region, status, genre, camping and search filters
 * @returns Matching festivals, upcoming first then by name
 */
export function listFestivals(
  filters: {
    region?: string;
    status?: string;
    genre?: string;
    camping?: string;
    search?: string;
  } = {}
): Festival[] {
  const { region, status, genre, camping, search } = filters;
  let festivals = listAllFestivals();
  if (region) festivals = festivals.filter((f) => f.region === region);
  if (status) festivals = festivals.filter((f) => f.status === status);
  if (genre) {
    const q = genre.toLowerCase();
    festivals = festivals.filter((f) => f.genre?.toLowerCase().includes(q));
  }
  if (camping === 'yes') festivals = festivals.filter((f) => f.camping === true);
  if (camping === 'no') festivals = festivals.filter((f) => f.camping === false);
  if (search) {
    const q = search.toLowerCase();
    festivals = festivals.filter((f) => f.name.toLowerCase().includes(q));
  }
  const now = new Date();
  return festivals.sort((a, b) => {
    const aUpcoming = !a.startDate || a.startDate >= now;
    const bUpcoming = !b.startDate || b.startDate >= now;
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    if (a.startDate && b.startDate) return a.startDate.getTime() - b.startDate.getTime();
    return a.name.localeCompare(b.name);
  });
}

/** One festival by slug, with promoter and lineups attached. */
export function getFestivalBySlug(slug: string): (Festival & { lineups: LineupEntry[] }) | null {
  const festival = listAllFestivals().find((f) => f.slug === slug);
  if (!festival) return null;
  const lineups = lineupList
    .filter((entry) => entry.festival === festival.name)
    .map((entry) => {
      const artist = artistList.find((a) => a.name === entry.artist);
      const artistView: Artist = artist
        ? {
            id: artist.id,
            name: artist.name,
            genre: artist.genre ?? null,
            homeCity: artist.homeCity ?? null,
          }
        : { id: slugify(entry.artist), name: entry.artist, genre: null, homeCity: null };
      return {
        id: `${entry.festival}-${entry.artist}-${entry.year}`,
        year: entry.year,
        isHeadliner: entry.headliner,
        artist: artistView,
      };
    })
    .sort((a, b) => b.year - a.year);
  return { ...festival, lineups };
}

/** All artists, sorted by name. */
export function listArtists(): Artist[] {
  return [...artistList]
    .map((a) => ({ id: a.id, name: a.name, genre: a.genre ?? null, homeCity: a.homeCity ?? null }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** One artist by slug, with their festival history grouped by year. */
export function getArtistBySlug(
  slug: string
):
  | (Artist & { appearances: Array<{ year: number; isHeadliner: boolean; festival: Festival }> })
  | null {
  const artist = artistList.find((a) => a.id === slug);
  if (!artist) return null;
  const artistView: Artist = {
    id: artist.id,
    name: artist.name,
    genre: artist.genre ?? null,
    homeCity: artist.homeCity ?? null,
  };
  const all = listAllFestivals();
  const appearances = lineupList
    .filter((entry) => entry.artist === artist.name)
    .map((entry) => {
      const festival = all.find((f) => f.name === entry.festival);
      return festival ? { year: entry.year, isHeadliner: entry.headliner, festival } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => b.year - a.year);
  return { ...artistView, appearances };
}

/** Artists who shared a festival with the given artist, for "also played with". */
export function listCoArtists(artistName: string, limit = 8): Artist[] {
  const sharedFestivals = new Set(
    lineupList.filter((entry) => entry.artist === artistName).map((entry) => entry.festival)
  );
  const coNames = new Set(
    lineupList
      .filter((entry) => sharedFestivals.has(entry.festival) && entry.artist !== artistName)
      .map((entry) => entry.artist)
  );
  return artistList
    .filter((a) => coNames.has(a.name))
    .slice(0, limit)
    .map((a) => ({ id: a.id, name: a.name, genre: a.genre ?? null, homeCity: a.homeCity ?? null }));
}

/** All promoters, sorted by name, with their festival counts. */
export function listPromoters(): Array<Promoter & { festivalCount: number }> {
  const all = listAllFestivals();
  return [...promoterList]
    .map((p) => ({
      id: p.id,
      name: p.name,
      region: p.region ?? null,
      genre: p.genre ?? null,
      instagram: p.instagram ?? null,
      facebook: p.facebook ?? null,
      website: p.website ?? null,
      notes: p.notes ?? null,
      festivalCount: all.filter((f) => f.promoter?.name === p.name).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** One promoter by slug, with their festivals. */
export function getPromoterBySlug(slug: string): (Promoter & { festivals: Festival[] }) | null {
  const promoter = promoterList.find((p) => p.id === slug);
  if (!promoter) return null;
  const promoterView: Promoter = {
    id: promoter.id,
    name: promoter.name,
    region: promoter.region ?? null,
    genre: promoter.genre ?? null,
    instagram: promoter.instagram ?? null,
    facebook: promoter.facebook ?? null,
    website: promoter.website ?? null,
    notes: promoter.notes ?? null,
  };
  const festivals = listAllFestivals().filter((f) => f.promoter?.name === promoter.name);
  return { ...promoterView, festivals };
}

/** Distinct regions with festival counts, sorted by count. */
export function listRegions(): Array<{ region: Region; count: number }> {
  const counts = new Map<string, number>();
  for (const f of listAllFestivals()) {
    if (!f.region) continue;
    counts.set(f.region, (counts.get(f.region) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([region, count]) => ({ region: region as Region, count }))
    .sort((a, b) => b.count - a.count);
}

/** Festivals in one region. */
export function listRegionFestivals(region: string): Festival[] {
  return listAllFestivals().filter((f) => f.region === region);
}

/** Festivals with coordinates, for the map. */
export function listMapFestivals(): Festival[] {
  return listAllFestivals().filter((f) => f.latitude !== null && f.longitude !== null);
}
