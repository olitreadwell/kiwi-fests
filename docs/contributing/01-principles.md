# 01 — Principles (non-negotiable)

These hold for every change, no exceptions.

## Never fabricate

- Never invent a data source, a statistic, a test result, a benchmark, or a
  "this worked" claim.
- Every fact in code, docs, tests, commit messages, and pull request
  descriptions must trace to something real: a run you did, a file that
  exists, a source you can name.
- If you cannot verify something, say so. Do not guess and do not silently
  skip.

## Scope discipline

- Change only what was asked. Do not refactor adjacent code as a side effect.
- Do not add features that are not in the spec.
- Do not "improve" unrelated files while you are in the area.
- Three similar lines beat a premature abstraction. Do not abstract until a
  pattern repeats and the abstraction is clearly cheaper.

## Minimal, correct diffs

- The smallest change that fixes the problem correctly.
- Prefer a root-cause fix over a surface patch. If the root cause is out of
  scope, say so and leave it alone.
- Do not chase unrelated bugs you notice; mention them in the summary instead.

## Honesty

- Report exactly what you ran and what happened. Never claim a change is
  verified when you did not run the checks.
- If a test is skipped or a check is advisory, say which.
- If something cannot be done (permissions, environment, missing data), report
  that plainly rather than working around it silently.

## Reversibility

- Prefer changes that can be reviewed and reverted.
- Before a destructive operation (delete, drop, migrate, force-push), confirm
  and state the backup or escape hatch first.

## Consistency

- Match the surrounding code. A new file in a repo with an established style
  follows that style, even when a different style would be more fashionable.
- One spelling per concept everywhere. Pick one name and use it.
