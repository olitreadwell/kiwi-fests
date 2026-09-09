# Getting started with a scaffolded project

After `gh repo create my-project --template olitreadwell/template --private`,
run the scaffolder:

```bash
pnpm install
pnpm run setup
```

## What the scaffolder does

- Renames `package.json` `name` (optionally `@scope/name`).
- Rewrites the README heading to the app name.
- Records your package-manager and deploy choices for the docs.

## What you do next

1. `pnpm run check` — prove the baseline is green before touching anything.
2. First commit: `git add -A && git commit -m "feat: init <app>"`.
3. Push and open the first PR into your `development` branch:
   `gh repo create <owner>/<app> --private --source . --push`.
4. Read `AGENTS.md` and `docs/contributing/00-index.md` before the first
   feature change.
