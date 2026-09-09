import { z } from 'zod';

/** One promoter or production company behind NZ festivals. */
export const promoterSchema = z
  .object({
    /** Stable kebab-case slug. */
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    /** Display name. */
    name: z.string().min(1),
    /** Region the promoter works in. */
    region: z.string().optional(),
    /** Genre focus, e.g. "Techno". */
    genre: z.string().optional(),
    /** Instagram profile URL. */
    instagram: z.url().optional(),
    /** Facebook page URL. */
    facebook: z.url().optional(),
    /** Website URL. */
    website: z.url().optional(),
    /** Anything worth knowing. */
    notes: z.string().optional(),
  })
  .strict();

/** A validated promoter. */
export type Promoter = z.infer<typeof promoterSchema>;

/** Validates the full promoter list in one pass. */
export const promoterListSchema = z.array(promoterSchema);

const rawPromoters = [
  {
    id: 'venom-events',
    name: 'Venom Events',
    region: 'Wellington',
    genre: 'Techno',
    instagram: 'https://www.instagram.com/venom.nz/',
    website: 'https://linktr.ee/venomfest',
    notes: 'Runs The Web club nights at Afters.',
  },
  {
    id: 'eyegum-music-collective',
    name: 'Eyegum Music Collective',
    region: 'Wellington',
    genre: 'Alternative / multi-genre, since 2013',
    instagram: 'https://www.instagram.com/eyegum/',
    facebook: 'https://www.facebook.com/eyegumevents/',
    notes: 'Runs Great Sounds Great and Free Wednesdays at San Fran.',
  },
  {
    id: 'audiology-touring',
    name: 'Audiology Touring',
    region: 'Nationwide',
    genre: 'Multi-genre, incl DnB / electronic',
    instagram: 'https://www.instagram.com/audiology_touring/',
    facebook: 'https://www.facebook.com/audiologyNZ/',
    website: 'https://www.audiologytouring.com/',
    notes: 'Runs Southern Sounds, Parklands, High Tide, SOTA, Ultra NZ.',
  },
  {
    id: 'propel-music',
    name: 'Propel Music',
    region: 'Auckland (nationwide coverage)',
    genre: 'Electronic music news, streaming and events',
    instagram: 'https://www.instagram.com/propelmusic.co.nz/',
    facebook: 'https://www.facebook.com/propelmusic.co.nz/',
    website: 'https://propelmusic.co.nz/',
    notes: 'Founded by Connor Berghoffer.',
  },
  {
    id: 'a-low-hum',
    name: 'A Low Hum',
    region: 'Wellington',
    genre: 'Underground / DIY, multi-genre',
    instagram: 'https://www.instagram.com/alowhum/',
    facebook: 'https://www.facebook.com/groups/campalh/',
    website: 'https://www.alowhum.com/',
    notes: 'Runs Camp A Low Hum and Infest.',
  },
  {
    id: '3333-events-and-productions',
    name: '3333 Events and Productions',
    region: 'Wellington (also Auckland, Christchurch, Dunedin)',
    genre: 'Multi-genre, festivals and corporate',
    instagram: 'https://www.instagram.com/3333events/',
    notes: 'Ran Spellbound 3.0 at Valhalla.',
  },
  {
    id: 'frisky-events-nz-partyboy-ltd',
    name: 'Frisky Events NZ (PartyBoy Ltd)',
    region: 'Wellington (nationwide)',
    genre: 'LGBTQIA+ events',
    instagram: 'https://www.instagram.com/friskyeventsnz/',
    facebook: 'https://www.facebook.com/friskytheparty/',
    notes: 'Runs Rave Cave, Frisky Funhouse. Owned by Chris and Caleb and DJ Jimmy Fade.',
  },
  {
    id: 'team-moksha',
    name: 'Team Moksha',
    region: 'Wellington',
    genre: 'Psytrance',
    facebook: 'https://www.facebook.com/teammokshanz/',
    notes: 'Psytrance gig organisers, ran Moksha 5 Year Anniversary at Valhalla.',
  },
  {
    id: 'froth-entertainment',
    name: 'Froth Entertainment',
    region: 'Wellington',
    genre: 'Club nights in unusual venues (war bunkers etc.)',
    instagram: 'https://www.instagram.com/froth.nz/',
    notes: 'Ran Elements at The Grand. Featured in Mixmag.',
  },
  {
    id: 'sonorous-circle-works-for-loudspeakers',
    name: 'Sonorous Circle (Works For Loudspeakers)',
    region: 'Wellington',
    genre: 'Noise / experimental / electro-acoustic',
    facebook: 'https://www.facebook.com/SonorousCircle/',
    notes: 'Bi-annual listening events and compilations.',
  },
  {
    id: 'dj-matai-movement-razored-raw',
    name: 'DJ Matai (Movement, Razored Raw)',
    region: 'Wellington',
    genre: '80s, goth, new wave, post-punk',
    instagram: 'https://instagram.com/movement_club',
    notes:
      'Runs Movement club night at Valhalla, now on its 3rd edition. Also drums in No Sector and Maced.',
  },
  {
    id: 'torque-sounds',
    name: 'Torque Sounds',
    region: 'Wellington',
    genre: 'DJ collective, brought Girls Torque to NZ',
    notes:
      'Original Girls Torque started London 2004 (The Fridge, Brixton). Confirmed as the actual Humanitix event organizer, no separate social account found.',
  },
  {
    id: 'sub180-entertainment',
    name: 'Sub180 Entertainment',
    region: 'Christchurch (also Auckland)',
    genre: 'Drum & bass, since 2010s',
    instagram: 'https://www.instagram.com/sub180nz/',
    facebook: 'https://www.facebook.com/SUB180NZ/',
    website: 'https://www.sub180.co.nz/',
    notes:
      'NZBN-registered company, Sockburn, Christchurch. Directors Christy Kimble and James Moir. Runs Mayhem and Urban Jungle. Launched One Eighty Records label.',
  },
  {
    id: 'audio-art',
    name: 'Audio Art',
    region: 'Auckland',
    genre: 'Psytrance, techno, bass, house, DnB',
    instagram: 'https://www.instagram.com/mysticrealmsfestivalnz/',
    facebook: 'https://www.facebook.com/AudioArtNZ/',
    notes: 'Runs Octoblast and Mystic Realms, both at Te Arai.',
  },
  {
    id: 'arkadien',
    name: 'Arkadien',
    region: 'Wellington',
    genre: 'Club nights ("Arkraiser" series)',
    website: 'https://www.arkadien.nz/',
    notes:
      'Runs regularly at Common Room. Tagline: "Where music, creativity and people flow in nature\'s rhythm."',
  },
  {
    id: 'eleventh-realm',
    name: 'Eleventh Realm',
    region: 'Auckland',
    genre: 'Underground techno',
    notes: 'Runs joint nights with SECT.',
  },
  {
    id: 'sect',
    name: 'SECT',
    region: 'Auckland',
    genre: 'Underground club',
    notes: 'Partners with Eleventh Realm.',
  },
  {
    id: 'orchard-collective',
    name: 'Orchard Collective',
    region: 'Auckland',
    notes: 'Listed as a promoter on Resident Advisor, no further detail found.',
  },
  {
    id: 'silk-collective',
    name: 'Silk Collective',
    region: 'Auckland',
    notes: 'Listed as a promoter on Resident Advisor, no further detail found.',
  },
  {
    id: 'auckland-techno-collective',
    name: 'Auckland Techno Collective',
    region: 'Auckland',
    genre: 'Techno, community/promotion',
    facebook: 'https://www.facebook.com/akldtechnocollective',
    notes: '~3100 FB likes.',
  },
  {
    id: 'terrainia',
    name: 'Terrainia',
    region: 'Auckland',
    genre: 'Electronic',
    notes: 'Ran a joint event with Eleventh Realm at Silent Studios, Dec 2025.',
  },
  {
    id: 'theta-project',
    name: 'Theta Project',
    region: 'Auckland',
    genre: 'Queer club nights',
    notes: 'Runs Homo House nights, e.g. at The Mothership.',
  },
  {
    id: 'drop-bass-nz-and-mb',
    name: 'Drop Bass NZ & MB',
    region: 'Auckland',
    genre: 'Drum & bass',
    notes: 'Brings international DnB artists to Mothership, Auckland CBD.',
  },
  {
    id: 'fuzen-nz',
    name: 'Fuzen NZ',
    region: 'Auckland (nationwide)',
    genre: 'Drum & bass',
    instagram: 'https://www.instagram.com/fuzennz/',
    notes: 'Runs Northern Bass. Also active at Neck of the Woods with The Liquid Lowdown.',
  },
  {
    id: 'dj-freecell-muzic-net-nz',
    name: 'DJ Freecell / Muzic.net.nz',
    region: 'Auckland',
    genre: 'DnB / electronic media and promotion',
    notes: 'Also runs the Muzic.nz media brand.',
  },
  {
    id: 'uprising-records',
    name: 'Uprising Records',
    region: 'Auckland',
    genre: 'Drum & bass label / scene anchor, since 2004',
    notes: 'By Matt Harvey and Evan Short of Concord Dawn.',
  },
  {
    id: 'haven',
    name: 'Haven',
    region: 'Christchurch (originally Auckland)',
    genre: 'Techno / experimental',
    instagram: 'https://www.instagram.com/thedchaven/',
    notes:
      "Runs under related imprints Keepsakes and Jaded Nineties Raver's Haven. IG account tentative, may be a venue account rather than Haven's own.",
  },
  {
    id: 'technotopia-claire-finnie',
    name: 'Technotopia (Claire Finnie)',
    region: 'Wellington',
    genre: 'Techno',
    notes: 'Runs techno nights at b.Space.',
  },
  {
    id: 'hang-the-saints',
    name: 'Hang The Saints',
    region: 'Wellington',
    genre: 'Techno',
    notes: 'Co-created a Wellington techno night with DJ Hunter (Christchurch) at Valhalla.',
  },
  {
    id: 'pur',
    name: 'Pur',
    region: 'Wellington',
    genre: 'Techno',
    notes:
      'Presenter credit on a Wellington techno night at Valhalla. Unclear if standalone brand or one-off.',
  },
  {
    id: 'asb-polyfest',
    name: 'ASB Polyfest',
    region: 'Auckland',
    genre: 'Pasifika / Māori schools cultural festival, since 1976',
    facebook: 'https://www.facebook.com/asbpolyfest',
    website: 'https://asbpolyfest.co.nz/',
    notes:
      "World's largest secondary-school Pasifika performing arts festival. 80000+ visitors, 6 cultural stages.",
  },
  {
    id: 'pasifika-festival',
    name: 'Pasifika Festival',
    region: 'Auckland',
    genre: 'Pacific cultural festival, since 1993',
    notes:
      'Free, 2-day community festival at Western Springs Park. 60000+ attendees. Council/Auckland Unlimited-run. Next edition 13-14 Mar 2027.',
  },
];

/** Curated promoters, seeded from the Aotearoa Festivals dataset. */
export const promoters: Promoter[] = promoterListSchema.parse(rawPromoters);
