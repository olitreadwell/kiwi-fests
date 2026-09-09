import { defineConfig, devices } from '@playwright/test';

// Bundled Chromium is not supported on older macOS; use system Chrome there.
// CI (ubuntu) keeps the bundled browser via `npx playwright install`.
const channel =
  process.env.PLAYWRIGHT_CHANNEL ?? (process.platform === 'darwin' ? 'chrome' : undefined);
// Overridable so parallel worktrees do not fight over one port.
const port = Number(process.env.E2E_PORT ?? 3123);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `pnpm dev -p ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      CONTACT_TO: 'test-contact@ot.mozmail.com',
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], ...(channel ? { channel } : {}) } },
  ],
});
