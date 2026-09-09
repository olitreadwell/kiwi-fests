# LLM-agent-optimized repositories

AI agents navigate code by text search and hover, not by reading everything.
A repository written for agents and humans reads like a well-indexed book:
every symbol is findable, every decision is explained where the reader lands,
and every pointer resolves.

## Principles

1. **Names are addresses.** A one-word export named `create` returns hundreds
   of unrelated hits; `createStripeClient` returns the one you want. Three
   words, one of them a domain word, is where a name stops being ambiguous.
2. **Doc comments are hover content.** IDE hover and peek must explain the
   symbol without opening the file: what it is for, parameters, return value.
3. **The comment sits where the grep lands.** Explanations live directly
   above the definition they explain.
4. **Files are search hits.** Split modules by concept and name them after
   the concept. The filename answers "where do I find X?".
5. **Docs point at real code.** Prose docs reference actual paths. A broken
   pointer is a failed build, enforced by `npm run check:links`.
6. **One spelling per concept.** Synonyms force agents to guess which term a
   repository uses. Pick one and use it everywhere.
7. **Deprecation is explicit.** `@deprecated <why>` stops a stale pattern
   from being copied into new code.

## The contract this repo encodes

- `AGENTS.md` and `CLAUDE.md`: how to work here, read first.
- `docs/contributing/`: the shared workflow standard.
- `docs/style-guide.md`: the writing rules.
- `pnpm run check`: the single proof a change is good — the same command CI
  runs, so an agent never has to ask "what else do I verify?".

## Why it matters

Every tool (Claude Code, Codex, Cursor, Gemini CLI, Windsurf) reads text the
same way. A repo that reads well for one reads well for all — and for the
humans reviewing the same files.
