# Philosophy

This template is optimized for two audiences: humans and AI coding agents.
Both must be able to open the repo and answer, without asking anyone,
"how do I work here, what is the quality bar, and how do I prove my change
is good?"

## One command proves quality

`pnpm run check` runs the entire gate — format, lint, typecheck, coverage,
build, smoke, e2e, link integrity — and CI runs the exact same thing.
No hidden steps, no local-only checks. The gate is a single decision: green
or not.

## Names are addresses

Code is navigated by grep and hover. A name like `get` is a guess; a name
like `getUserProfileById` is an address. Every exported symbol gets a
domain-scoped name and a doc comment that says what it is for, not just what
it does. Searchable names and hover content are the cheapest documentation
that ever ships.

## Validation at the boundary

Untrusted input is parsed once, at the edge, with an explicit schema (zod in
`src/server/`). Everything downstream can assume shape and spend its energy
on the actual problem. A 400 at the door beats a 500 in the middle of the
night.

## Failure is loud, structured, and centralized

Errors become JSON responses via `src/lib/errors.ts`, logs are one JSON line
per event, and nothing crashes on bad input. Observability is the default,
not an afterthought.

## Everything has an owner

Every repo produced from this template ships with the same defaults: tests,
coverage gate, CI, container, security policy, contributing guide, and
agent instructions. The scaffold owns the setup so the project owns the
product.

`docs/engineering.md` encodes these as concrete rules;
`docs/style-guide.md` and `docs/llm-agent-optimization.md` make them
executable by writers and agents.
