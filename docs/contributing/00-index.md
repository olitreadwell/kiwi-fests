# 00 — Index and how to use this guide

This directory is the contribution standard for this repository. Every
contributor, human or agent, follows it. It is deliberately generic: it says
nothing about any specific programming language, framework, or AI tool.

## Reading order

For a first change, read all of these before writing code:

- `01-principles.md` — the non-negotiable rules (start here)
- `02-workflow.md` — how a contribution should flow
- `03-code-quality.md` — what the code must look like
- `04-testing.md` — how changes get tested
- `05-git-workflow.md` — branches, commits, pull requests
- `06-security.md` — what must never be shipped
- `07-documentation.md` — when docs change
- `08-verification.md` — how to prove the change works
- `09-tooling.md` — environment, dependencies, CI

For an urgent fix or a one-line change, `01-principles.md` plus the relevant
section is enough, but read the index first so nothing is a surprise.

## Who reads this

- **Humans** enter through `CONTRIBUTING.md` at the repository root.
- **AI coding agents** enter through `AGENTS.md` at the repository root.

Both files point here. `docs/contributing/` is the single source of truth;
tool-specific files only point at it.

## How each agent discovers the guide

Different coding agents read different files. Wire them so they all land in
`docs/contributing/00-index.md`:

| Tool | File(s) agents read | Suggested content |
| --- | --- | --- |
| Claude Code | `CLAUDE.md` at root | One line pointing at `AGENTS.md` |
| Codex / OpenAI agents | `AGENTS.md` at root | The included `AGENTS.md` |
| Cursor | `.cursor/rules/*.mdc` or `AGENTS.md` | A rule pointing at `AGENTS.md` |
| Gemini CLI | `GEMINI.md` at root | One line pointing at `AGENTS.md` |
| Windsurf | `.windsurf/rules/*.md` or `AGENTS.md` | A rule pointing at `AGENTS.md` |
| Any generic agent | `AGENTS.md` at root | The included `AGENTS.md` |

If a repository already has one of these files, merge the pointer into it
rather than overwriting project content.

## What this guide never does

- Never names a language, framework, or tool as required.
- Never assumes a package manager, CI provider, or hosting platform.
- Never contradicts a repository's own `AGENTS.md`/`CLAUDE.md`; those win.

## Language notes

Stack-specific pages live in `languages/` and are copied only when they match
this repository's stack. See the list below for what applies here.

<!-- LANGUAGE-NOTES-START -->
- typescript: `languages/typescript.md`
- docker: `languages/docker.md`
<!-- LANGUAGE-NOTES-END -->

To regenerate this section, re-run `scripts/copy.sh --detect` from the
template.
