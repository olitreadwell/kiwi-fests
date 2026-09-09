# Self-improvement loop

The directory improves on a daily/weekly cadence using real usage data.
Everything below works in snapshot mode (logs + committed JSON) and gets
stronger in DB mode (persistent tables).

## Signals we collect

- `search_events` — every search query + result count (`/api/search`,
  `GET /api/v1/items?q=`)
- `item_views` — every listing open (POST `/api/items/{id}/view`)
- `scrapes` — every scraper run: source, status, items found/new, error
- `opt-outs` — removal requests (instant in DB mode, PR in snapshot mode)
- Community issues — add/fix/review prefilled from detail pages

DB mode stores these in the `analytics`, `scrapes` and `candidates` tables
(`scripts/migrate.mjs`); snapshot mode logs `analytics:*` lines and
`logs/scrapes.jsonl`.

## Automated loop (`pnpm scrape`)

1. Run scrapers in order (`src/lib/scrapers/run-all.ts`); each is isolated
   behind try/catch so one failure never halts the refresh.
2. Discover candidates not already in the dataset
   (`src/lib/scrapers/discover.ts`).
3. Verify + promote (`pnpm scrape --apply` writes merged items back to
   `src/data/snapshot.json`; the daily Vercel cron does this in DB mode and
   upserts items + logs the run).

Daily (Vercel Cron `/api/cron/refresh`, 2am NZT, `CRON_SECRET`-guarded):
DB mode scrapes + upserts; snapshot mode reports `skipped` — snapshot
deploys update by running `pnpm scrape:apply` and committing.

## Data hygiene (weekly)

- Remove stale candidates: DB mode
  `DELETE FROM candidates WHERE status='new' AND found_at < now() - interval '30 days';`
- Review failing scrapers:
  `SELECT source, status, count(*) FROM scrapes GROUP BY 1,2 ORDER BY 3 DESC;`
- Spot dead-end searches:
  `SELECT payload->>'query', count(*) FROM analytics WHERE event_type='search' GROUP BY 1 ORDER BY 2 DESC LIMIT 20;`
- Fix the worst source, add a test, log it in `CHANGELOG.md`.

## Weekly checklist

- [ ] One scraper or dataset fix, tested and changelogged
- [ ] One engagement-driven improvement (below)
- [ ] Verify no listings show as stale without a follow-up source
- [ ] `pnpm run check` green before merging anything

## Ideas backlog (pick by engagement)

- Email alerts for new listings (subscribe module exists, env-gated;
  wire an ESP)
- "Most viewed" and "new this week" filters
- Per-listing user feedback/reviews (tracked in
  https://github.com/olitreadwell/dataset-directory-template/issues/1)
- Opt-out verification flow (email confirm)
- Category suggestions from search dead ends

## Guardrails

- Never scrape private/paywalled data
- Opt-out is instant and permanent until the subject asks to return
- Scraper failures never take the site down (isolated + logged)
- Every listed item keeps a `source` URL and `lastVerified` date
