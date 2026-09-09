# 04 — Testing

Every change ships with evidence that it works. The evidence is a test, a
reproducible manual check, or a run you can point at. Never claim "it works"
without one of those.

## When a change needs tests

- Behavior changes (fixed bug, new feature) get a test that fails on the old
  behavior and passes on the new one.
- Refactors that change no behavior get the existing suite as the gate; add
  tests only where coverage is clearly missing.
- Docs-only changes get no tests, but they do get a review of the doc's
  commands and examples.
- If the repo has no tests, add the smallest test that proves the change and
  say so in the summary.

## What a good test looks like

- Proves one thing. A failing test tells you exactly what broke.
- Runs fast enough to be part of the default check command.
- Never depends on a real network, real credentials, or production data.
- Avoids coupling to implementation details when a behavioral assertion
  proves the same thing.
- Follows the repo's existing test conventions: file naming, location,
  framework, style. Match, do not invent.

## Order of verification

1. The most specific test for what you changed.
2. The wider suite in the same area.
3. The full default check (lint, format, typecheck, tests, build).

## Honesty rules

- A test that passes without running the code it claims to test is not a
  test. Delete it or fix it.
- A skipped test is a reported fact, not a silent pass. Say which are
  skipped and why.
- Do not weaken a test to make it pass. Fix the code or fix the test's
  assumptions, and say which.
- Coverage is a floor, not a target: write tests because they prove
  behavior, not to hit a number.
