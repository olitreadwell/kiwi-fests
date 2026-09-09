# Security

## Reporting

Do not open a public issue for a suspected vulnerability. Email the
maintainers (address in `CODE_OF_CONDUCT.md` or the git author) with details.
Include affected versions and a minimal reproduction; do not include live
secrets.

## Baseline (enforced by CI)

- **Dependency audit** — `pnpm audit --audit-level=high` blocks CI
  (`.github/workflows/security.yml`). The advisory-only pass in `ci.yml`
  reports; the security workflow blocks.
- **Secrets scan** — `scripts/security-checks.sh` fails CI when any `.env`
  file (other than `.env.example`) is committed, or when tracked files match
  secret patterns (GitHub tokens, AWS keys, Stripe live keys, private keys).
- **Boundary validation** — every public route parses input with zod
  (`src/server/`); bad input answers 400 before it reaches business logic.
- **Pinned dependencies** — exact versions, no floating ranges; dependabot
  proposes upgrades and limits open PRs to 5.
- **Centralized errors** — `src/lib/errors.ts` maps failures to JSON
  responses; nothing crashes on bad input.

## Fail-open principle

Automation never approves, merges, or closes on its own. Anything that
interprets a PR or an issue is advisory and requires explicit human
opt-in — borrowed from the pr-vetting action.

## Local checks

```bash
pnpm run audit
bash scripts/security-checks.sh
```

Run both before pushing anything that touches credentials or CI.
