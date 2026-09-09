# Aotearoa Festivals

[![CI](https://github.com/olitreadwell/kiwi-fests/actions/workflows/ci.yml/badge.svg)](https://github.com/olitreadwell/kiwi-fests/actions/workflows/ci.yml)

New Zealand music festivals, the promoters and production companies behind
them, and the artists who play them.

Built on [olitreadwell/dataset-directory-template](https://github.com/olitreadwell/dataset-directory-template):
dataset + scrapers + OpenAPI API + website + feeds + community loop +
daily refresh, wired in from day one.

## What you get

- **Dataset** — zod-validated festivals with `calendarDates` and festival
  facts (status, genre, cost, camping, attendance, ticket price, promoter),
  plus supplementary artist, promoter and lineup data. Commit
  `src/data/items.ts`, regenerate the snapshot with `pnpm run build:snapshot`,
  or scrape.
- **API** — `/api/v1/items`, `/api/v1/items/{id}`, `/api/v1/cities`,
  `/api/v1/categories`, `/api/v1/dataset` (JSON + `.csv`, ETag +
  content-hash version), `/api/v1/dataset/meta`, `/api/search`,
  `/api/items/{id}/view`, `/api/opt-out`, `/api/cron/refresh`, plus the
  base `/health`, contact and feedback endpoints. OpenAPI 3.1 at
  `/api/openapi.json`, Swagger UI at `/docs`, contract-tested against a
  live server in `pnpm run smoke`.
- **Website** — home dashboard with region/status/genre/camping filters
  and map, festival detail with lineup and promoter, artist and promoter
  browse, region browse, season planner, fuzzy search, interactive map,
  opt-out page, dark mode.
- **Feeds** — `/feed.xml` RSS, `/calendar.ics` iCal, dynamic
  `/sitemap.xml`, `/robots.txt`.
- **Scrapers** — Node + cheerio-ready framework with robots.txt checks,
  rate limiting, exponential backoff + jitter, per-run `scrapes` logging
  and the candidate discovery → verification → promotion loop. Ships an
  offline example scraper; add your real sources in `src/lib/scrapers/`.
- **Snapshot mode by default** — no `DATABASE_URL`? The site serves the
  committed `src/data/snapshot.json`. Set `DATABASE_URL` and `pnpm db:setup`
  to switch to Postgres (`items`, `scrapes`, `candidates`, `analytics`).
- **Daily refresh** — Vercel Cron at 2am NZT (`vercel.json`),
  `CRON_SECRET`-protected.
- **Community loop** — opt-out, prefilled add/fix/review issues from every
  detail page, zod + tests as the PR gate, optional env-gated email
  subscribe module. Ethics: public data only, polite scraping.

## Quick start

```bash
pnpm install
pnpm run dev        # http://localhost:3000
```

## Commands

| Command | Purpose | CI gate |
| --- | --- | --- |
| `pnpm run dev` | Dev server | |
| `pnpm run build` | Production build | Blocking |
| `pnpm run setup` | Interactive scaffolder (identity, env, deploy) | Tested |
| `pnpm run build:snapshot` | Regenerate `src/data/snapshot.json` from `items.ts` | Blocking |
| `pnpm run scrape` | Run scrapers (snapshot or DB mode) | |
| `pnpm run scrape:apply` | Scrape and write merged items to the snapshot | |
| `pnpm db:setup` | Migrate + seed Postgres (DB mode) | |
| `pnpm db:snapshot` | Export live DB → `snapshot.json` | |
| `pnpm run contract` | Live server ↔ OpenAPI contract test | In smoke |
| `pnpm run typecheck` | `tsc --noEmit` | Blocking |
| `pnpm run lint` | ESLint | Blocking |
| `pnpm run format:check` | Prettier check | Blocking |
| `pnpm test` | Vitest unit/component | Blocking |
| `pnpm run test:coverage` | Coverage gate | Blocking |
| `pnpm run test:e2e` | Playwright | Blocking |
| `pnpm run test:a11y` | axe route audit (WCAG 2.2 A/AA) | Blocking (in e2e) |
| `pnpm run smoke` | Boot + curl + contract test | Blocking |
| `pnpm run check:links` | Internal link integrity | Blocking |
| **`pnpm run check`** | All of the above | Mirrored 1:1 |
| `pnpm run audit` | Dependency audit | Advisory |

## Data model

- **Festival** — status (active/TBC/hiatus/defunct/unconfirmed), region,
  dates, cost, notes, camping, attendance, ticket price, promoter
- **Promoter** — the production company/collective behind festivals
- **Artist** — DJs/acts
- **Lineup** — join table: which artist played which festival's edition in
  which year

## Pages & Routes

| Route | Description |
| --- | --- |
| `/` | Home — upcoming festivals grid, live counts, region browsing links |
| `/festivals` | Browse all festivals with region/status filters and pagination |
| `/festivals/[slug]` | Festival detail — lineup, promoter info, breadcrumbs, add-to-calendar |
| `/calendar` | Monthly festival calendar view with subscribe link |
| `/calendar.ics` | All upcoming festivals iCal feed |
| `/plan` | Plan your festival season — upcoming festivals grouped by NZ season |
| `/artists` | Browse all artists, paginated |
| `/artists/[slug]` | Artist detail — festival history across editions |
| `/promoters` | Browse all promoters, paginated |
| `/promoters/[slug]` | Promoter detail — list of festivals they run |
| `/regions` | Browse festivals by NZ region |
| `/regions/[region]` | Festivals in one region, with an email subscribe CTA |
| `/about` | About the project — mission, how it works, contribute |
| `/map` | Interactive NZ map — festivals by region, color-coded, clickable |
| `/search` | Client-side fuzzy search across festivals/artists/promoters (Fuse.js) |
| `/feed.xml` | RSS feed of upcoming active/TBC festivals |
| `/sitemap.xml` | Dynamic sitemap covering all festivals, artists, and promoters |
| `/subscribe`, `/api/subscribe` | Email subscription flow |
| `/unsubscribe`, `/api/unsubscribe` | Token-based unsubscribe flow |

## Docs

- [API](docs/api.md) — endpoints, auth, rate limits, contract test
- [Contact & feedback](docs/contact.md) — how the forms work
- [Deploy](docs/deploy.md) — Vercel, cron, env vars
- [Engineering](docs/engineering.md) — architecture, data flow
- [Testing](docs/testing.md) — unit, e2e, a11y, smoke
- [Template sync](docs/template-sync.md) — how quality gates stay current
