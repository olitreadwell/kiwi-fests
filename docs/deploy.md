# Deployment

- Docker: `docker build -t app . && docker run -p 3000:3000 app`.
  Multi-stage, `node:22-alpine`, HEALTHCHECK on `/health`.
- Vercel: `vercel --prod` (or connect the repo; `pnpm run check` already
  ran green in CI). Set `CRON_SECRET` (`openssl rand -hex 32`) so
  `/api/cron/refresh` accepts the daily 2am NZT cron, plus `DATABASE_URL`
  (Neon / Vercel Postgres) to switch from snapshot mode. Feed/sitemap URLs
  use `NEXT_PUBLIC_SITE_URL`.
- GitHub Pages (alternative): static export from the committed snapshot.
  `NEXT_OUTPUT_MODE=export pnpm build` (workflow:
  `.github/workflows/github-pages.yml`). API/feed/cron routes are
  serverless-only and do not exist in the export — refresh the site by
  running `pnpm run scrape:apply` and committing.
- Env: every runtime setting comes from env vars (`.env.example` documents
  them). Never commit real keys.
