# TypeScript / JavaScript notes

Exact commands come from the repository's own config. Check `package.json`
scripts and any `tsconfig.json` before assuming anything below.

- **Package manager**: the repo pins one. Match it exactly; never mix
  package managers, never commit a foreign lockfile.
- **Quality gates**: typecheck (`tsc --noEmit` or the repo's script), lint,
  format, tests, build. Run them all before finishing.
- **Tests**: unit tests sit next to source or in a test dir; name test files
  after their source (`stripe.test.ts` tests `stripe.ts`). Use the repo's
  runner (Vitest, Jest, node:test, or similar).
- **Naming**: camelCase variables and functions, PascalCase types and
  components, kebab-case file names unless the repo does otherwise.
- **Strict mode**: no `any` or untyped escape hatches. Export functions with
  explicit return types.
- **Avoid**: stray `console.log` in committed code, magic numbers, untyped
  props, dead imports, `TODO` comments that outlive the task.

## Common traps for agents

- `npm ci` respects the lockfile; `npm install` may drift it. Match the repo's
  documented install command.
- Type-only imports should be marked `type` where the repo's style does so.
- Watch for two package managers' lockfiles in one repo (a migration smell);
  report it, do not "fix" it silently.
