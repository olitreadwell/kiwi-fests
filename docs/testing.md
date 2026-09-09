# Testing guide

Three layers, all gated:

- Unit/component: Vitest + Testing Library + vitest-axe in
  `src/**/*.test.ts(x)`. Coverage gate: v8, 80% lines (`vitest.config.ts`).
- Smoke: `scripts/smoke.sh` boots the real built server and curls every route.
- E2E: Playwright in `e2e/`, chromium, against a real dev server.

Tests sit beside the code they test. New behavior ships with tests or it
does not ship.
