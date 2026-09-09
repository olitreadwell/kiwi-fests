# Template build — orchestration board

Status: **complete** (2026-08-25).

## Flow

1. Feature work in worktrees on short branches, PRs into `development`.
2. Green CI -> squash merge into `development` (orchestrator).
3. `development` -> `main` integration PR (#1) stays open, always up to date.
4. End state: all features merged into `development`, PR #1 shows full set,
   worktrees and feature branches cleaned up.

## Merged queue

| Branch | PR | CI | Merged |
| --- | --- | --- | --- |
| `docs/template/llm_agent_docs_optimization` | #2 | green | yes |
| `feat/template/setup_scaffolder` | #3 | green | yes |
| `ci/template/ci_security_hardening` | #4 | green | yes |

## Remaining

- `development` -> `main` integration PR (#1): open, updated, awaiting human
  review before final merge.
- Worktrees `template-wt-{docs,setup,ci}`: removed after this run.
