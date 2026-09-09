# TEMPLATE_USAGE — new project in 10 minutes

This template turns "open directory of {THING} in {PLACE}" into a working,
deployed product fast: dataset + scrapers + OpenAPI API + website + feeds +
community loop + daily refresh. Here is the exact path, timed to under 10
minutes.

## 1. Create the repo (1 min)

```bash
gh repo create my-thing-directory \
  --template olitreadwell/dataset-directory-template --private
cd my-thing-directory
pnpm install
```

## 2. Scaffold (2 min)

```bash
pnpm run setup
```

Answers asked:

- Repo name (defaults to the folder name)
- Thing (singular), e.g. `op shop`
- Things (plural), e.g. `op shops`
- Start city, e.g. `Wellington`
- Region, e.g. `Wellington region`
- Seed sources (comma-separated names/URLs — written into `DATA_SOURCES.md`)
- Contact email
- Public site URL (empty in dev; set `NEXT_PUBLIC_SITE_URL` in Vercel later)
- GitHub repo for community links (enables add/fix/review issue links)
- Deploy target: `vercel` (default) or `github-pages` (static export)

`setup` rewrites: `package.json` name, `src/lib/site-config.ts`, README
heading, `.env.example` (and writes `.env`), `DATA_SOURCES.md`.

Non-interactive form (CI-friendly):

```bash
node scripts/setup.mjs --app-name op-shop-directory \
  --thing "op shop" --thing-plural "op shops" --city Wellington \
  --region "Wellington region" --seed-sources "example.com/a,example.com/b" \
  --site-url "https://op-shop-directory.vercel.app" \
  --gh-repo "oli/op-shop-directory" --contact-email "help@example.com"
```

## 3. Verify (3-5 min — first run downloads + builds)

```bash
pnpm run check   # format, lint, typecheck, coverage, setup tests, build,
                 # smoke + contract test, e2e + axe, internal links
```

Everything runs without a database: the committed
`src/data/snapshot.json` is the read path until you add `DATABASE_URL`.

## 4. Add your real dataset (per project)

Two equivalent paths, mix freely:

1. **Curated**: edit `src/data/items.ts` (zod-validated; bad data fails
   `pnpm run check`), then `pnpm run build:snapshot` to regenerate
   `src/data/snapshot.json`.
2. **Scraped**: add scrapers in `src/lib/scrapers/` following
   `src/lib/scrapers/example.ts`, then `pnpm run scrape:apply` to merge
   candidates into the snapshot. In DB mode (`DATABASE_URL` set):
   `pnpm db:setup`, then `pnpm scrape` writes `items`/`scrapes`/`candidates`.

Rules: public data only, `robots.txt` respected, 500ms+ per-origin delay,
15s timeout, every run logged in `scrapes` (DB) or `logs/scrapes.jsonl`
(snapshot). Update `DATA_SOURCES.md` status table as sources move from
`planned` → `working`.

## 5. Deploy (2-4 min)

### Vercel (recommended)

```bash
vercel --prod
```

Then in the Vercel dashboard set env vars: `CRON_SECRET`
(`openssl rand -hex 32`), and optionally `DATABASE_URL` (Neon/Vercel
Postgres). `vercel.json` schedules `/api/cron/refresh` daily at 2am NZT
(14:00 UTC); the endpoint refuses requests without the secret.

### GitHub Pages (alternative)

```bash
NEXT_OUTPUT_MODE=export pnpm build
```

The included `.github/workflows/github-pages.yml` builds an export and
deploys to Pages on push. Note: API/feed/cron routes are Vercel-only; the
static export serves the site from the committed snapshot. See
[docs/deploy.md](docs/deploy.md).

## 6. Community loop (on by default)

- Every detail page has prefilled **add / fix / review** GitHub issue links
  (needs `NEXT_PUBLIC_GH_REPO`).
- The dataset zod schema + tests are the PR gate: bad days, duplicate ids,
  slug mismatches and broken sources fail `pnpm run check`.
- `/opt-out` lets anyone listed request removal (instant in DB mode, PR in
  snapshot mode).
- The base template ships contact + feedback forms (proof-of-work gated)
  that file labelled issues.

## What the template does NOT include (per-project add-ons)

- Festival lineups / join tables
- Quiz compare / season planners
- Star-rating review UI (skeleton tracked in
  https://github.com/olitreadwell/dataset-directory-template/issues/1)

## Keep pulling template updates

```bash
node scripts/sync-from-template.mjs            # dry-run
node scripts/sync-from-template.mjs --apply    # copy + commit template files
```

Policies live in `template-manifest.json` (template repo). App code and
dataset files are `copyIfAbsent` — your local versions always win.
