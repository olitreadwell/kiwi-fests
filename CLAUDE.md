# CLAUDE.md

Stack-specific notes for this template.

- Node 22 (`.nvmrc` is the source of truth; `mise` and `asdf` read it).
- pnpm with a committed `pnpm-lock.yaml`; `pnpm install --frozen-lockfile`
  in CI and Docker. Pick one package manager per repo.
- Next.js standalone output; the Dockerfile runs `server.js`.
- Vitest coverage gates live in `vitest.config.ts` (v8, 80% lines).
- Playwright config in `playwright.config.ts`; specs in `e2e/`.
- Tailwind 4 via `@tailwindcss/postcss`; Radix UI primitives in
  `src/components/ui` (shadcn aliases in `components.json`).
- `src/lib` = pure domain logic + shared services; `src/server` = contracts;
  `src/app` = routes only.
