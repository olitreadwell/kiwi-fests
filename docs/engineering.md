# Engineering standards

The concrete rules that make this repo safe for humans and AI agents to
edit in parallel:

- **One command contract.** `pnpm run check` runs the full gate; CI mirrors
  it. No local-only checks, no hidden steps.
- **Names are addresses.** Exports get 2-3 word, domain-prefixed names so a
  grep or an agent search lands on exactly one thing.
- **Doc comments on every export** with `@param`/`@returns` where useful, so
  IDE hover and peek explain the symbol without opening the file.
- **WHY comments.** Comments explain why a non-obvious choice was made, never
  restate the code.
- **Validation at the boundary.** Zod schemas in `src/server/` parse input
  once; downstream code assumes shape.
- **API contract.** OpenAPI 3.1 generated from the same zod schemas, served
  at `/api/openapi.json`, rendered by Swagger UI at `/docs`, and enforced by
  a contract test (`src/server/openapi.test.ts`). See `docs/api.md`.
- **Centralized errors.** `src/lib/errors.ts` maps failures to JSON
  responses; nothing crashes on bad input.
- **Structured logs.** pino writes one JSON line per event to stdout.
- **Docs in the same change.** Behavior and its docs move together.

See `docs/philosophy.md` for the reasoning behind these rules.
