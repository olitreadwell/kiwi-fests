# Style guide

The concrete writing rules for code in this repo. These exist so an IDE
hover, a grep, or an agent search answers a question without opening a file.

## Components

- Use Radix UI primitives for interaction components (label, accordion,
  select, dialog, switch). They are wrapped in `src/components/ui/` with
  Tailwind styling — add to that folder instead of hand-rolling.
- Native inputs and textareas live in `src/components/ui/input.tsx` and
  `textarea.tsx` so all forms share one style.
- Keep pages thin: forms render state, submission logic stays in `src/lib`
  and `src/server` so it is unit-testable without a browser.

## Links

- External links (http/https, protocol-relative) open in a new tab:
  `target="_blank"` with `rel="noopener noreferrer"`. Enforced by
  `pnpm run check:external-links` (part of `check` and CI).

## Every exported symbol gets a doc comment

JSDoc/TSDoc above the definition, not inside it:

```ts
/**
 * Fetch a user's profile by id, including membership roles.
 *
 * @param userId - Stable identifier from the auth session
 * @returns The profile, or null when the user does not exist
 */
export function getUserProfileById(userId: string): UserProfile | null
```

Rules:

- Write the comment for IDE hover and peek: what it is for, not just what it does.
- Include `@param` for every parameter and `@returns` where the return is
  non-obvious.
- `@throws` where a caller can hit a documented failure.
- `@deprecated <reason>` when something must not be used; never silently
  remove a public symbol.

## Comments explain WHY, never WHAT

```ts
// Good: explains why the code exists
// Retry once: the catalog service is eventually consistent after writes.
const profile = await getProfile(userId).catch(() => getProfile(userId));

// Bad: restates the code
// Call getProfile with userId
const profile = await getProfile(userId);
```

## Names are addresses

- 2-3 word, domain-prefixed exports: `createStripeClient`, not `create` or
  `client`.
- One spelling per concept across the whole repo (`orgId`, never
  `organisation` in one file and `orgId` in another).
- Files named after the concept they own; test files named after their
  source (`links.test.ts` tests `links.ts`).
- No `any`. A precise type lets the next reader reason from the signature.

## Comments above the definition

A grep for a symbol lands on the definition; the explanation must be right
there, above it. Never bury the why inside a function body.

## Modules organized by concept

Split by concept, not by size: `validation.ts`, `errors.ts`, `logger.ts`,
`links.ts`. The filename itself is a search hit.

## Docs point at real code

Every "Where:" or "see" pointer in docs must be a path that exists. The link
checker (`pnpm run check:links`) fails the build on a dead pointer.

## No invented abbreviations

`cfg`, `impl`, `req`, `fn` save nothing under a tokenizer and cost clarity.
Use the full word: `config`, `implementation`, `request`, `function`.
