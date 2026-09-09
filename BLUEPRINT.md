# Starter Template Blueprint

Research output: what `template/` should contain, synthesized from the most
recent personal repos (`~/.agents` conventions + GitHub activity through
2026-08-25). Every claim cites evidence. Where a pattern repeats across 3+
repos, it is promoted to a default; where it appears once, it is flagged
optional.

## 0. Evidence base

Repos analyzed (most recent first, personal repos only):

| Repo | Stack | Notable |
| --- | --- | --- |
| `oss-contrib-pipeline` | Shell | Makefile `check` gate, bats, shellcheck, security checks |
| `nz-open-data-connectors` | TS + Python + Ruby | npm workspaces, Dockerfile, rate limiting, publish/release workflows |
| `nz-tech-for-good` | TS + Python | Turborepo, shared config packages, pytest unit/integration/smoke |
| `nz-data-lab` | TS | Turborepo, `scripts/setup.mjs` scaffolder, deploy matrix |
| `new-zealand-data` | Python | Makefile gate, lychee linkcheck, GitHub Pages |
| `active-learning` | Node TS | `check` = all gates incl. build + smoke + e2e; 100% coverage; Dockerfile + HEALTHCHECK |
| `mapping` | Next.js | pnpm, husky parallel pre-commit, a11y ESLint rules, pino logging |
| `scratchpad` | Next.js | husky, vitest, smoke script |
| `aotearoa-festivals` | Next.js + Prisma | vitest coverage config, Playwright, husky |
| `read-the-room-ed-homepage` | Astro | vitest + Playwright + `check` script |
| `wt-zod` / `wt-ci` / `wt-lessons` / `wt-games` | Node TS | identical scaffold: Dockerfile, Playwright, eslint, docs |
| `template-proposal` | Turborepo | Next.js 15 template, integration branches, `setup.mjs` scaffolder |
| `agent-contributing-template` | Markdown | drop-in `docs/contributing/` via `scripts/copy.sh` |
| `learning/` collection | 10 stacks | SPEC-TEMPLATE.md: doc-comment-on-every-export rule, 100% coverage |
| global `AGENTS.md` | - | 19-point app quality baseline, branch naming, 2-3 word export names |

## 1. Canonical stack

Default for a new app: **single-package Next.js web app** - the pattern that
recurs across `mapping`, `scratchpad`, `aotearoa-festivals`,
`template-proposal`, `nz-tech-for-good`, `nz-data-lab`.

- **Runtime:** Node 22 LTS (`.nvmrc` single source of truth; `engines` mirrors
  it). Next.js 15/16 App Router, React 19, TypeScript strict.
- **Styling:** Tailwind CSS 4 + shadcn/ui (`components.json`).
- **Tests:** Vitest + Testing Library + vitest-axe (unit/component),
  Playwright (e2e). Storybook only when a component library is the point.
- **Quality:** ESLint 9 flat config (`eslint.config.mjs`), Prettier
  (`.prettierrc.json` + `.prettierignore`), `tsc --noEmit` typecheck.
- **Packaging:** npm + committed `package-lock.json` by default; pnpm is an
  accepted alternate (`mapping`, `read-the-room-ed-homepage`) - pick one and
  stay with it.
- **Git hooks:** husky - pre-commit runs quality gates (pattern from
  `mapping/.husky/pre-commit`), pre-push runs full `check`.
- **Monorepo:** Turborepo only when 2+ apps (pattern from `nz-tech-for-good`/
  `nz-data-lab`); single package otherwise.
- **Deploy:** Vercel (`vercel.json`) for Next.js; GitHub Pages for static data
  sites (`new-zealand-data`).

### Alternate defaults

| Kind of project | Default |
| --- | --- |
| API only, no framework | Node TS, `tsx`, node:test runner with 100% coverage flags (`active-learning`) |
| Content / marketing site | Astro (`read-the-room-ed-homepage`) |
| Python data / CLI / action | `pyproject.toml`, ruff (lint+format), mypy, pytest, Makefile `check` (`pr-vetting`) |
| Shell pipeline | Makefile gate: `bash -n`, bats, shellcheck, smoke, security (`oss-contrib-pipeline`) |
| Multi-language connectors | npm workspaces + `packages/` per language (`nz-open-data-connectors`) |

---

## 2. Directory skeleton (canonical single-app template)

```
template/
├── .github/
│   └── workflows/ci.yml          # mirrors `check` exactly + audit + e2e jobs
├── .husky/
│   ├── pre-commit                # parallel gates (typecheck+build | lint | tests)
│   └── pre-push                  # full `check`
├── .dockerignore
├── .env.example                  # keys documented, never real values
├── .gitignore                    # node_modules, .next, .env*, coverage, reports
├── .nvmrc                        # e.g. 22.17.1
├── AGENTS.md                     # agent instructions, points into docs/
├── CLAUDE.md                     # stack-specific notes (present in most repos)
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md               # from agent-contributing-template via copy.sh
├── LICENSE                       # MIT (code) / dual for data repos
├── README.md                     # what / quickstart / commands table / stack / docs
├── SECURITY.md                   # missing in most repos - include by default
├── Dockerfile                    # multi-stage + HEALTHCHECK (active-learning)
├── components.json               # shadcn
├── docs/
│   ├── onboarding.md
│   ├── testing.md
│   ├── engineering.md            # conventions incl. naming rule
│   └── deploy.md
├── e2e/
│   └── app.spec.ts
├── eslint.config.mjs             # flat config, next core-web-vitals + ts + a11y
├── next.config.ts
├── package.json                  # pinned deps, engines, scripts (see §5)
├── package-lock.json
├── playwright.config.ts
├── postcss.config.mjs
├── public/
├── scripts/
│   ├── smoke.sh                  # boots real server, curls every route
│   └── setup.mjs                 # interactive scaffolder (see §4)
├── src/
│   ├── app/                      # routes incl. /health + /api routes
│   ├── components/
│   ├── lib/                      # domain logic, all exports doc-commented
│   └── server/                   # API routes, validation at boundary
├── tsconfig.json
└── vitest.config.ts              # v8 coverage, include src/lib
```

---

## 3. Every scaffold must include (checklist)

Maps 1:1 to the global 19-point baseline (`AGENTS.md`).

1. `git init` + initial conventional commit on scaffold.
2. Pinned deps: exact versions, lockfile committed, no `^`/`~` ranges.
3. Env config: `.env.example` committed; secrets never; feature flags via env.
4. Stateless: state in backing service; `data/` gitignored (SQLite dev pattern, `active-learning`).
5. Structured logs to stdout (pino, seen in `mapping`).
6. Port binding + `GET /health` answering 200; Docker `HEALTHCHECK` curls it.
7. Centralized error handling: JSON errors, never crash on bad input.
8. Input validation at boundary: zod (`wt-zod`, `feat/api/zod_validation`).
9. Tests: unit + integration + smoke + e2e; coverage gate (100% learning / realistic for apps).
10. Lint + format + typecheck + build in one `check` command.
11. CI mirrors `check` + security audit + Playwright job with artifact.
12. Dependency audit: `npm audit` job (advisory, `|| true`) + dependabot.
13. Dockerfile: multi-stage, `node:*-alpine`, `npm ci --omit=dev`, `HEALTHCHECK`.
14. README + `docs/` + AGENTS.md (doc-comment every export - learning rule).
15. `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `LICENSE`.
16. `CHANGELOG.md`.
17. `.nvmrc` + `engines` + CI reads `node-version-file: .nvmrc`.

---

## 4. Scaffolding automation design

Target: new repo in under two minutes, hands off a green CI.

1. **Template repo** (this repo) on GitHub. One-liner start:
   `gh repo create my-project --template olitreadwell/template --private`
2. **`scripts/setup.mjs`** - interactive scaffolder (pattern:
   `nz-data-lab/scripts/setup.mjs`):
   - prompts: app name, scope/org, package manager, deploy target;
   - renames `package.json` name, README title, `{{APP_NAME}}` placeholders;
   - rewrites README/CHANGELOG headers;
   - `--dry-run` (show prompts, no writes) + `--help` + tests (`setup.test.mjs`
     exists in `template-proposal`);
   - falls back to readline when `@clack/prompts` absent.
3. **Opt-in integrations via branches**: `git merge origin/integration/prisma`,
   `integration/auth`, `integration/sentry`, `integration/storybook`
   (pattern: `template-proposal/docs/integrations/`).
4. **Contributing docs**: `scripts/copy.sh` from `agent-contributing-template`
   drops in `AGENTS.md`, `CONTRIBUTING.md`, `docs/contributing/` and rewrites
   `{{REPO_NAME}}`.
5. **Post-scaffold auto-validate**: `npm ci`, `npm run check`, first
   conventional commit, push, confirm CI green; enable dependabot + branch
   protection.
6. **Guardrail**: refuse to scaffold over a non-empty directory; require fresh
   git repo.

---

## 5. Repeatable commands

Single `check` command = everything (mirrored by CI):

| Script | Runs |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `eslint .` |
| `npm run format` / `format:check` | prettier write / check |
| `npm test` | vitest run |
| `npm run test:coverage` | vitest with coverage gate |
| `npm run test:e2e` | playwright test |
| `npm run smoke` | `scripts/smoke.sh` (boot server, curl routes) |
| `npm run audit` | `npm audit` |
| **`npm run check`** | `format:check && lint && typecheck && test:coverage && build && smoke && test:e2e` |

Non-JS equivalents keep the same contract via `Makefile check: format lint
type test` (`pr-vetting`) or the shell gate (`oss-contrib-pipeline`).

---

## 6. Anti-patterns to avoid (from evidence)

- **Inconsistent script names:** `typecheck` vs `type-check` across repos. Pick `typecheck` once, everywhere.
- **Advisory-only CI gates:** `mapping` CI sets `continue-on-error: true` for
  lint/tests; `template-proposal` says only type-check + build block. Decide:
  `check` is blocking. Green CI must mean the same as green local `check`.
- **Copy-paste forks:** `blackbird-terminal-demo copy`, `learning copy` -
  duplicated folders, no rename. Scaffolder must rename, never copy.
- **Hardcoded Node version in CI** (`mapping` pins `node-version: 20` while
  repo has `.nvmrc`). Always `node-version-file: .nvmrc`.
- **Husky without hooks:** `active-learning` has `prepare: husky` but no
  committed hooks. Template ships pre-commit/pre-push content.
- **`postinstall` heavy work** (`prisma generate` in `aotearoa-festivals`) -
  slow, network-dependent installs. Use explicit `db:generate` instead.
- **Secrets near code:** `.env` exists in some repos (gitignored, but risky).
  Keep `.env.example` as the only committed env file; add a CI check that fails
  on `.env` presence.
- **Mixed lockfiles after a switch** (`mapping` uses `pnpm-lock.yaml`, others
  npm). One lockfile per repo; CI cache keyed to it.

---

## 7. Deferred / optional (integration branches, not defaults)

- Prisma + migrations (`aotearoa-festivals`)
- Auth (Kinde; `template-proposal` integration)
- Sentry (env-gated DSN, `nz-open-data-connectors`)
- Rate limiting + CORS on public API routes (`nz-open-data-connectors`)
- Storybook (only with a component library)
- Dependabot auto-merge + release-age sweep (`nz-tech-for-good`)
- Release workflow: tag `v*` -> `gh release create --generate-notes`
  (`nz-open-data-connectors`)
- Link checker (lychee + `.lycheeignore`) for link-heavy repos
- a11y + visual regression suites (`nz-data-lab`)
- Codespell, yamllint where the domain fits

---

## 8. Build order for this repo

1. **Scaffold**: `package.json`, `tsconfig`, `src/app`, `src/lib`, health
   route, all config files from §2; wire `check` from §5.
2. **Quality**: ESLint + Prettier + Vitest + Playwright + husky hooks; coverage
   gate.
3. **CI**: `ci.yml` mirroring `check` + audit + e2e; `node-version-file`,
   concurrency, timeouts.
4. **Container**: multi-stage Dockerfile + `HEALTHCHECK` + `.dockerignore`.
5. **Docs**: README, `docs/` suite, `AGENTS.md`, `CLAUDE.md`,
   SECURITY/CONTRIBUTING/CODE_OF_CONDUCT/LICENSE, CHANGELOG.
6. **Automation**: `scripts/setup.mjs` + tests; integration branches; `copy.sh`
   for contributing docs.
7. **Validate end-to-end**: `gh repo create` a scratch repo from this template,
   run `setup.mjs`, run `npm run check`, watch CI go green, delete scratch repo.
8. **Enable template flag**: repo settings -> *is a template*.

## Definition of done

- One command installs a fresh repo from this template; one command (`check`)
  validates it; CI agrees with local.
- Scaffold completes in under 2 minutes including initial commit.
- Generated repo passes: unit + integration + smoke + e2e, coverage gate,
  audit, container build, health check.
- `AGENTS.md` and `docs/` point at real files; every exported symbol has a doc
  comment.
