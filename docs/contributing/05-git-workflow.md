# 05 — Git workflow

## Branches

- Create a branch per change. Name it after the change's purpose using the
  repo's convention when one exists.
- Match the upstream style for forks and PRs; follow the target repo's
  evident convention before defaulting to your own.
- Keep the branch small enough that it can be reviewed in one sitting.

## Commits

- One concern per commit; the commit message states what and why.
- Use the repo's commit style (format, prefix, footer conventions). Do not
  invent a second style.
- Do not bundle unrelated formatting with a behavior change.
- Never force-push a shared branch without saying so first and knowing what
  the escape hatch is.

## Pull requests

- One PR per logical change. A PR that mixes a bug fix, a refactor, and an
  unrelated doc edit is three PRs waiting to happen.
- Fill the repo's PR template when one exists. If the repo has no template,
  state what changed, why, and how it was verified (see
  `templates/PR_DESCRIPTION.md`).
- Reference the issue the change fixes, and link evidence (test output, CI
  runs) rather than asserting.

## Reviewing

- Read the diff before approving; do not approve on trust.
- Name the problem, the location, and the fix in review comments.
- Distinguish blocking issues (wrong behavior, missing test, broken gate)
  from style opinions.
- When you request changes, say exactly what must change for a re-review.

## History discipline

- Prefer the rebase or squash flows the repo already uses; do not introduce
  a new history model.
- Clean up your own messes before they reach shared branches.
