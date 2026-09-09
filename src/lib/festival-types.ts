/** Lifecycle status of a festival listing, matching the seed data. */
export const FestivalStatus = {
  ACTIVE: 'ACTIVE',
  TBC: 'TBC',
  HIATUS: 'HIATUS',
  DEFUNCT: 'DEFUNCT',
  UNCONFIRMED: 'UNCONFIRMED',
} as const;

export type FestivalStatus = (typeof FestivalStatus)[keyof typeof FestivalStatus];

/** NZ region taxonomy, matching the seed data. */
export const Region = {
  NORTHLAND: 'NORTHLAND',
  AUCKLAND: 'AUCKLAND',
  WAIKATO: 'WAIKATO',
  BAY_OF_PLENTY: 'BAY_OF_PLENTY',
  GISBORNE: 'GISBORNE',
  HAWKES_BAY: 'HAWKES_BAY',
  TARANAKI: 'TARANAKI',
  MANAWATU_WHANGANUI: 'MANAWATU_WHANGANUI',
  WELLINGTON: 'WELLINGTON',
  WAIRARAPA: 'WAIRARAPA',
  TASMAN: 'TASMAN',
  NELSON: 'NELSON',
  MARLBOROUGH: 'MARLBOROUGH',
  WEST_COAST: 'WEST_COAST',
  CANTERBURY: 'CANTERBURY',
  OTAGO: 'OTAGO',
  SOUTHLAND: 'SOUTHLAND',
  ONLINE: 'ONLINE',
} as const;

export type Region = (typeof Region)[keyof typeof Region];

/** One festival, as the domain pages read it. */
export interface Festival {
  id: string;
  name: string;
  slug: string;
  status: FestivalStatus;
  region: Region | null;
  location: string | null;
  genre: string | null;
  costText: string | null;
  dateText: string | null;
  startDate: Date | null;
  endDate: Date | null;
  notes: string | null;
  website: string | null;
  approved: boolean;
  vibe: string | null;
  camping: boolean | null;
  ticketPrice: string | null;
  ticketUrl: string | null;
  attendance: number | null;
  latitude: number | null;
  longitude: number | null;
  promoterId: string | null;
  promoter: Promoter | null;
}

/** One promoter or production company. */
export interface Promoter {
  id: string;
  name: string;
  region: string | null;
  genre: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  notes: string | null;
}

/** One artist who plays NZ festivals. */
export interface Artist {
  id: string;
  name: string;
  genre: string | null;
  homeCity: string | null;
}

/** One artist booked for one festival edition. */
export interface LineupEntry {
  id: string;
  year: number;
  isHeadliner: boolean;
  artist: Artist;
}
