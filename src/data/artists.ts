import { z } from 'zod';

/** One artist who plays NZ festivals. */
export const artistSchema = z
  .object({
    /** Stable kebab-case slug. */
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    /** Display name. */
    name: z.string().min(1),
    /** Genre label, e.g. "Electronic / Bass". */
    genre: z.string().optional(),
    /** Home city, e.g. "Sydney, AU". */
    homeCity: z.string().optional(),
  })
  .strict();

/** A validated artist. */
export type Artist = z.infer<typeof artistSchema>;

/** Validates the full artist list in one pass. */
export const artistListSchema = z.array(artistSchema);

const rawArtists = [
  {
    id: 'alison-wonderland',
    name: 'Alison Wonderland',
    genre: 'Electronic / Bass',
    homeCity: 'Sydney, AU',
  },
  {
    id: 'andy-c',
    name: 'Andy C',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'wilkinson',
    name: 'Wilkinson',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'sub-focus',
    name: 'Sub Focus',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'dimension',
    name: 'Dimension',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'chase-and-status',
    name: 'Chase and Status',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'netsky',
    name: 'Netsky',
    genre: 'Drum & Bass',
    homeCity: 'Belgium',
  },
  {
    id: 'flume',
    name: 'Flume',
    genre: 'Electronic',
    homeCity: 'Sydney, AU',
  },
  {
    id: 'dom-dolla',
    name: 'Dom Dolla',
    genre: 'House',
    homeCity: 'Melbourne, AU',
  },
  {
    id: 'lab',
    name: 'LAB',
    genre: 'Reggae / Dub',
    homeCity: 'Whakatāne',
  },
  {
    id: 'fat-freddys-drop',
    name: 'Fat Freddys Drop',
    genre: 'Dub / Soul',
    homeCity: 'Wellington',
  },
  {
    id: 'shapeshifter',
    name: 'Shapeshifter',
    genre: 'Drum & Bass / Soul',
    homeCity: 'Christchurch',
  },
  {
    id: 'katchafire',
    name: 'Katchafire',
    genre: 'Reggae',
    homeCity: 'Hamilton',
  },
  {
    id: 'salmonella-dub',
    name: 'Salmonella Dub',
    genre: 'Dub / Reggae',
    homeCity: 'Kaikōura',
  },
  {
    id: 'tiki-taane',
    name: 'Tiki Taane',
    genre: 'Dub / Drum & Bass',
    homeCity: 'Christchurch',
  },
  {
    id: 'ice-spice',
    name: 'Ice Spice',
    genre: 'Hip Hop / Rap',
    homeCity: 'NYC, US',
  },
  {
    id: 'sammy-virji',
    name: 'Sammy Virji',
    genre: 'UK Garage / Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'luude',
    name: 'Luude',
    genre: 'Electronic / Drum & Bass',
    homeCity: 'Sydney, AU',
  },
  {
    id: 'rl-grime',
    name: 'RL Grime',
    genre: 'Trap / Bass',
    homeCity: 'LA, US',
  },
  {
    id: 'meduza',
    name: 'Meduza',
    genre: 'House',
    homeCity: 'Italy',
  },
  {
    id: 'koven',
    name: 'Koven',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'pendulum',
    name: 'Pendulum',
    genre: 'Drum & Bass',
    homeCity: 'Perth, AU',
  },
  {
    id: 'shy-fx',
    name: 'Shy FX',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'peking-duk',
    name: 'Peking Duk',
    genre: 'Electronic',
    homeCity: 'Canberra, AU',
  },
  {
    id: 'dope-lemon',
    name: 'Dope Lemon',
    genre: 'Indie',
    homeCity: 'Sydney, AU',
  },
  {
    id: 'sachi',
    name: 'Sachi',
    genre: 'Electronic',
    homeCity: 'Auckland',
  },
  {
    id: 'corrella',
    name: 'Corrella',
    genre: 'Roots / Reggae',
    homeCity: 'Auckland',
  },
  {
    id: 'lee-mvtthews',
    name: 'Lee Mvtthews',
    genre: 'Drum & Bass',
    homeCity: 'Auckland',
  },
  {
    id: 'coterie',
    name: 'Coterie',
    genre: 'Roots / Reggae',
    homeCity: 'Perth, AU',
  },
  {
    id: 'sir-dave-dobbyn',
    name: 'Sir Dave Dobbyn',
    genre: 'Rock / Pop',
    homeCity: 'Auckland',
  },
  {
    id: 'oppidan',
    name: 'Oppidan',
    genre: 'UK Garage',
    homeCity: 'London, UK',
  },
  {
    id: 'hannah-laing',
    name: 'Hannah Laing',
    genre: 'House / Techno',
    homeCity: 'Dundee, UK',
  },
  {
    id: 'grafix',
    name: 'Grafix',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'eloise',
    name: 'Eloise',
    genre: 'Drum & Bass',
    homeCity: 'Wellington',
  },
  {
    id: 'messie',
    name: 'Messie',
    genre: 'Electronic / Pop',
    homeCity: 'Gisborne',
  },
  {
    id: 'elipsa',
    name: 'Elipsa',
    genre: 'Drum & Bass',
    homeCity: 'Bristol, UK',
  },
  {
    id: 'lady-shaka',
    name: 'Lady Shaka',
    genre: 'Global Club',
    homeCity: 'London, UK',
  },
  {
    id: 'lsb',
    name: 'LSB',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'mia-koden',
    name: 'Mia Koden',
    genre: 'Bass / UKG',
    homeCity: 'London, UK',
  },
  {
    id: 'midland',
    name: 'Midland',
    genre: 'House / Techno',
    homeCity: 'London, UK',
  },
  {
    id: 'becky-hill',
    name: 'Becky Hill',
    genre: 'Pop / Dance',
    homeCity: 'London, UK',
  },
  {
    id: 'basement-jaxx',
    name: 'Basement Jaxx',
    genre: 'House / Electronic',
    homeCity: 'London, UK',
  },
  {
    id: 'the-streets',
    name: 'The Streets',
    genre: 'UK Garage / Hip Hop',
    homeCity: 'Birmingham, UK',
  },
  {
    id: 'supergroove',
    name: 'Supergroove',
    genre: 'Rock / Funk',
    homeCity: 'Auckland',
  },
  {
    id: 'maverick-sabre',
    name: 'Maverick Sabre',
    genre: 'Soul / R&B',
    homeCity: 'London, UK',
  },
  {
    id: 'leisure',
    name: 'Leisure',
    genre: 'Indie / Electronic',
    homeCity: 'Auckland',
  },
  {
    id: 'sudan-archives',
    name: 'Sudan Archives',
    genre: 'Electronic / R&B',
    homeCity: 'LA, US',
  },
  {
    id: 'kesha',
    name: 'Kesha',
    genre: 'Pop',
    homeCity: 'LA, US',
  },
  {
    id: 'ocean-alley',
    name: 'Ocean Alley',
    genre: 'Indie / Rock',
    homeCity: 'Sydney, AU',
  },
  {
    id: 'leftfield',
    name: 'Leftfield',
    genre: 'Electronic',
    homeCity: 'London, UK',
  },
  {
    id: 'royksopp',
    name: 'Royksopp',
    genre: 'Electronic',
    homeCity: 'Norway',
  },
  {
    id: 'kora',
    name: 'Kora',
    genre: 'Roots / Reggae',
    homeCity: 'Whakatāne',
  },
  {
    id: 'jalen-ngonda',
    name: 'Jalen Ngonda',
    genre: 'Soul',
    homeCity: 'NYC, US',
  },
  {
    id: 'split-enz',
    name: 'Split Enz',
    genre: 'Rock / Pop',
    homeCity: 'Auckland',
  },
  {
    id: 'flux-pavilion',
    name: 'Flux Pavilion',
    genre: 'Dubstep / Electronic',
    homeCity: 'London, UK',
  },
  {
    id: 'kings-of-the-rollers',
    name: 'Kings of the Rollers',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'a-trak',
    name: 'A-Trak',
    genre: 'Hip Hop / Electronic',
    homeCity: 'Montreal, CA',
  },
  {
    id: 'degs',
    name: 'Degs',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'dj-hazard',
    name: 'DJ Hazard',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'dj-hype',
    name: 'DJ Hype',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'flava',
    name: 'Flava',
    genre: 'Drum & Bass',
    homeCity: 'Auckland',
  },
  {
    id: 'the-upbeats',
    name: 'The Upbeats',
    genre: 'Drum & Bass',
    homeCity: 'Wellington',
  },
  {
    id: 'state-of-mind',
    name: 'State of Mind',
    genre: 'Drum & Bass',
    homeCity: 'Auckland',
  },
  {
    id: 'turno',
    name: 'Turno',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'ciko',
    name: 'Ciko',
    genre: 'Drum & Bass',
    homeCity: 'Auckland',
  },
  {
    id: 'damage-control',
    name: 'Damage Control',
    genre: 'Drum & Bass',
    homeCity: 'Christchurch',
  },
  {
    id: 'young-franco',
    name: 'Young Franco',
    genre: 'House',
    homeCity: 'Brisbane, AU',
  },
  {
    id: 'cassie-henderson',
    name: 'Cassie Henderson',
    genre: 'Drum & Bass',
    homeCity: 'Auckland',
  },
  {
    id: 'charlotte-plank',
    name: 'Charlotte Plank',
    genre: 'Drum & Bass',
    homeCity: 'London, UK',
  },
  {
    id: 'frankie-venter',
    name: 'Frankie Venter',
    genre: 'Pop',
    homeCity: 'Auckland',
  },
  {
    id: 'frank-booker',
    name: 'Frank Booker',
    genre: 'House / Disco',
    homeCity: 'Auckland',
  },
  {
    id: 'dick-johnson',
    name: 'Dick Johnson',
    genre: 'House / Techno',
    homeCity: 'Auckland',
  },
  {
    id: '1991',
    name: '1991',
  },
  {
    id: 'a-little-sound',
    name: 'A Little Sound',
  },
  {
    id: 'anais',
    name: 'Anais',
  },
  {
    id: 'andromedik',
    name: 'Andromedik',
  },
  {
    id: 'andy-c-tonn-piper',
    name: 'Andy C + Tonn Piper',
  },
  {
    id: 'arcando',
    name: 'Arcando',
  },
  {
    id: 'benee',
    name: 'BENEE',
  },
  {
    id: 'bari',
    name: 'Bari',
  },
  {
    id: 'basslayerz',
    name: 'Basslayerz',
  },
  {
    id: 'beccie-b',
    name: 'Beccie B',
  },
  {
    id: 'benny-salvador',
    name: 'Benny Salvador',
  },
  {
    id: 'black-sun-empire',
    name: 'Black Sun Empire',
  },
  {
    id: 'break',
    name: 'Break',
  },
  {
    id: 'c-frim',
    name: 'C.Frim',
  },
  {
    id: 'chicconeli-tali',
    name: 'Chicconeli + Tali',
  },
  {
    id: 'chole',
    name: 'Chole',
  },
  {
    id: 'chris-keene',
    name: 'Chris Keene',
  },
  {
    id: 'christoph-el-truento',
    name: 'Christoph El Truento',
  },
  {
    id: 'clean-bandit',
    name: 'Clean Bandit',
  },
  {
    id: 'corella',
    name: 'Corella',
  },
  {
    id: 'culture-shock',
    name: 'Culture Shock',
  },
  {
    id: 'dj-snake',
    name: 'DJ Snake',
  },
  {
    id: 'day-we-ran',
    name: 'Day We Ran',
  },
  {
    id: 'dean-thursley',
    name: 'Dean Thursley',
  },
  {
    id: 'delicious',
    name: 'Delicious',
  },
  {
    id: 'disco-lines',
    name: 'Disco Lines',
  },
  {
    id: 'drax-project',
    name: 'Drax Project',
  },
  {
    id: 'dylan-c',
    name: 'Dylan C',
  },
  {
    id: 'dylanbiscuit-b2b-ajhoneysuckle',
    name: 'DylanBiscuit b2b ajhoneysuckle',
  },
  {
    id: 'ellen-jetay-1',
    name: 'Ellen Jetay-1',
  },
  {
    id: 'emma',
    name: 'Emma',
  },
  {
    id: 'estere',
    name: 'Estère',
  },
  {
    id: 'example',
    name: 'Example',
  },
  {
    id: 'fms',
    name: 'FMS',
  },
  {
    id: 'flamingo-pier',
    name: 'Flamingo Pier',
  },
  {
    id: 'franca',
    name: 'Franca',
  },
  {
    id: 'friction',
    name: 'Friction',
  },
  {
    id: 'friction-presents-synergy',
    name: 'Friction presents Synergy',
  },
  {
    id: 'frost-children',
    name: 'Frost Children',
  },
  {
    id: 'general-levy-joe-awira',
    name: 'General Levy + Joe Awira',
  },
  {
    id: 'goldtooth',
    name: 'GoldTooth',
  },
  {
    id: 'grouch',
    name: 'Grouch',
  },
  {
    id: 'half-queen',
    name: 'Half Queen',
  },
  {
    id: 'hamdi',
    name: 'Hamdi',
  },
  {
    id: 'harriet-jaxxon',
    name: 'Harriet Jaxxon',
  },
  {
    id: 'harry-hayes',
    name: 'Harry Hayes',
  },
  {
    id: 'iish',
    name: 'Iish',
  },
  {
    id: 'irah',
    name: 'Irah',
  },
  {
    id: 'ivy-lab',
    name: 'Ivy Lab',
  },
  {
    id: 'jme',
    name: 'JME',
  },
  {
    id: 'jackie-hollander',
    name: 'Jackie Hollander',
  },
  {
    id: 'joe-hunt',
    name: 'Joe Hunt',
  },
  {
    id: 'john-summit',
    name: 'John Summit',
  },
  {
    id: 'ki-ki',
    name: 'KI/KI',
  },
  {
    id: 'kaiviti',
    name: 'Kaiviti',
  },
  {
    id: 'kara',
    name: 'Kara',
  },
  {
    id: 'kings-of-the-rollers-inja',
    name: 'Kings of the Rollers + INJA',
  },
  {
    id: 'l-a-b',
    name: 'L.A.B',
  },
  {
    id: 'lamchopz',
    name: 'Lamchopz',
  },
  {
    id: 'lamour',
    name: 'Lamour',
  },
  {
    id: 'lang',
    name: 'Lang',
  },
  {
    id: 'layton-giordani',
    name: 'Layton Giordani',
  },
  {
    id: 'lens',
    name: 'Lens',
  },
  {
    id: 'lime-cordiale',
    name: 'Lime Cordiale',
  },
  {
    id: 'mall-grab',
    name: 'Mall Grab',
  },
  {
    id: 'marjorie-sinclair',
    name: 'Marjorie Sinclair',
  },
  {
    id: 'miss-kaninna',
    name: 'Miss Kaninna',
  },
  {
    id: 'nightmares-on-wax',
    name: 'Nightmares on Wax',
  },
  {
    id: 'nymphloads',
    name: 'NymphLoads',
  },
  {
    id: 'om-unit',
    name: 'OM UNIT',
  },
  {
    id: 'orikoi',
    name: 'ORiKoi',
  },
  {
    id: 'oskar-med-k',
    name: 'Oskar med K',
  },
  {
    id: 'osmosis-jones',
    name: 'Osmosis Jones',
  },
  {
    id: 'pearly',
    name: 'Pearly*',
  },
  {
    id: 'pirapus',
    name: 'Pirapus',
  },
  {
    id: 'pixie-lane',
    name: 'Pixie Lane',
  },
  {
    id: 'quix',
    name: 'Quix',
  },
  {
    id: 'robustt',
    name: 'Robustt',
  },
  {
    id: 'romi-wrights',
    name: 'Romi Wrights',
  },
  {
    id: 'rova',
    name: 'Rova',
  },
  {
    id: 'royel-otis',
    name: 'Royel Otis',
  },
  {
    id: 'royksopp',
    name: 'Röyksopp',
  },
  {
    id: 's-p-y',
    name: 'S.P.Y',
  },
  {
    id: 'sin-and-broin',
    name: 'Sin & Broin',
  },
  {
    id: 'sin-and-brook',
    name: 'Sin & Brook',
  },
  {
    id: 'sister-nancy-legal-shot',
    name: 'Sister Nancy + Legal Shot',
  },
  {
    id: 'skepsis',
    name: 'Skepsis',
  },
  {
    id: 'sless',
    name: 'Sless',
  },
  {
    id: 'son-and-water',
    name: 'Son & Water',
  },
  {
    id: 'songer',
    name: 'Songer',
  },
  {
    id: 'subsonic',
    name: 'Subsonic',
  },
  {
    id: 'swindle',
    name: 'Swindle',
  },
  {
    id: 'tali',
    name: 'Tali',
  },
  {
    id: 'tami-neilson',
    name: 'Tami Neilson',
  },
  {
    id: 'tantrum-desire',
    name: 'Tantrum Desire',
  },
  {
    id: 'te-kurahuia',
    name: 'Te KuraHuia',
  },
  {
    id: 'te-wehi-and-hori-shaw-the-final-sunset',
    name: 'Te Wehi & Hori Shaw "The Final Sunset"',
  },
  {
    id: 'the-chainsmokers',
    name: 'The Chainsmokers',
  },
  {
    id: 'twofaced',
    name: 'Twofaced',
  },
  {
    id: 'vercetti',
    name: 'Vercetti',
  },
  {
    id: 'vince-staples',
    name: 'Vince Staples',
  },
  {
    id: 'waewaexpress',
    name: 'WAEWAEXPRESS',
  },
  {
    id: 'waxx',
    name: 'Waxx',
  },
  {
    id: 'witters-and-mc-crafty',
    name: 'Witters & MC Crafty',
  },
  {
    id: 'yen',
    name: 'Yen',
  },
  {
    id: 'zedd',
    name: 'Zedd',
  },
  {
    id: 'zozo',
    name: 'Zozo',
  },
  {
    id: 'aszewo',
    name: 'Łaszewo',
  },
];

/** Curated artists, seeded from the Aotearoa Festivals dataset. */
export const artists: Artist[] = artistListSchema.parse(rawArtists);
