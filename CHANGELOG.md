# Changelog

All notable changes documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added

- Dataset-directory template layer over the base starter:
  - Generic `items` schema (zod) with seed dataset + snapshot mode
    (`src/data/snapshot.json`) and Postgres mode (`items`, `scrapes`,
    `candidates`, `analytics`)
  - OpenAPI API surface: `/api/v1/items`, `/items/{id}`, `/cities`,
    `/categories`, `/dataset` (JSON+CSV, ETag/version), `/dataset/meta`,
    `/api/search`, `/api/items/{id}/view`, `/api/opt-out`,
    `/api/cron/refresh`, subscribe/unsubscribe; Swagger at `/docs`;
    live-server contract test in smoke
  - Website: browse, fuzzy search, detail pages with community
    add/fix/review issue links, map, opt-out, dark mode
  - Feeds: `/feed.xml`, `/calendar.ics`, dynamic `/sitemap.xml`,
    `/robots.txt`
  - Scraper framework: robots.txt checks, rate limiting, backoff+jitter,
    per-run scrapes logging, candidate discovery→verification→promotion,
    with an offline example scraper
  - Vercel Cron daily refresh (2am NZT, `CRON_SECRET`-guarded)
  - Extended `pnpm run setup` scaffolder (thing, city, region, seed
    sources, deploy target) + `sync-from-template.mjs` pointed at this
    repo; docs: TEMPLATE_USAGE, DATA_SOURCES, SELF_IMPROVEMENT
- Starter template skeleton: Next.js, TS strict, Tailwind 4, Vitest,
  Playwright, ESLint 9, Prettier, husky, Docker, CI.
- Tracked follow-up: user feedback feature →
  https://github.com/olitreadwell/dataset-directory-template/issues/1
