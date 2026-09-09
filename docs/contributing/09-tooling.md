# 09 — Tooling

## Environment

- Use the repo's declared tool versions (runtime, package manager, linters).
  Do not upgrade toolchains as a side effect of a change.
- If the repo pins a package manager, use that one. Do not introduce
  another.
- Keep local tooling aligned with CI's versions so "works locally" and
  "passes in CI" mean the same run.

## Dependencies

- Follow the repo's pinning policy: exact versions where the repo does,
  lockfiles committed where they exist.
- Never add a dependency without a reason; prefer the standard library and
  what the repo already has.
- Before adopting a new tool, judge its maintenance, licenses, and
  provenance; unvetted tools are fine to run ad hoc, not to adopt as
  standing parts of the repo's pipeline.

## CI

- Match the repo's CI layout; do not introduce a second provider for the
  same job.
- The same checks run in CI and locally where possible. If CI is stricter
  than local, say so.
- Never quiet a failing CI step to make a PR look green.

## Commands

- If the repo exposes one check command, it is the thing to run before
  finishing any change.
- Document new commands in the docs that point to them; see
  `07-documentation.md`.
