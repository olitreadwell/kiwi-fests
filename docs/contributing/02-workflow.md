# 02 — Workflow

The same loop applies to humans and agents. Follow it in order; skipping steps
is where mistakes happen.

## 1. Read the instructions first

- Read `AGENTS.md` (agents) or `CONTRIBUTING.md` (humans), then this index.
- Note any project-level rules that override the generic guide.

## 2. Explore before editing

- Find the relevant code by searching text, not by guessing file names.
- Read the files you will touch, plus their tests.
- Check how the repo is laid out and where tests live.
- If the task is multi-step, state the plan before implementing.

## 3. Plan

- Break the work into ordered steps. Small steps with a check between each.
- Name the verification step for each step (test, build, manual check).

## 4. Implement

- Follow the repo's conventions and this guide's quality rules.
- Write or update tests in the same change as the behavior.
- Keep each commit focused on one concern.

## 5. Verify

- Run the repo's check command (lint, format, typecheck, tests, build) or the
  equivalent set for this codebase.
- Start with the most specific test for what you changed, then broaden.
- Fix failures and re-run until green. Do not paper over failures.

## 6. Summarize

- State what changed, why, and what you verified.
- Name anything you could not verify or did not run.
- Flag risks, follow-up work, and any pre-existing issues you noticed.

## When to stop and ask

- When the spec is ambiguous and a wrong guess is expensive.
- When the fix requires a design decision the repo has not made.
- When you would need to modify files outside the task's scope.
- When a check fails and the failure looks unrelated to your change.
