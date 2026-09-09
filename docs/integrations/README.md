# Optional integrations

Optional features live on integration branches so the core template stays
lean. Enable one by merging its branch into your project:

```bash
git merge origin/integration/prisma
```

## Planned integrations

| Branch | Adds |
| --- | --- |
| `integration/prisma` | Database + migrations (pattern from `aotearoa-festivals`) |
| `integration/auth` | Authentication (Kinde) |
| `integration/sentry` | Error tracking, env-gated via `SENTRY_DSN` |
| `integration/storybook` | Component workshop for library-heavy apps |

## Rules for integration branches

- Each integration branch lives in the template repo and stays buildable on
  its own: `pnpm run check` passes.
- Merging never edits core template files that the branch does not own; the
  branch adds files and wires them in.
- Each branch documents its setup in `docs/integrations/<name>.md`.
