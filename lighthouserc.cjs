module.exports = {
  ci: {
    collect: {
      url: [
        'http://127.0.0.1:3000/',
        'http://127.0.0.1:3000/contact',
        'http://127.0.0.1:3000/feedback',
        'http://127.0.0.1:3000/help',
      ],
      startServerCommand: 'if [ -f pnpm-lock.yaml ]; then pnpm start; else npm start; fi',
      numberOfRuns: 1,
      settings: { chromeFlags: '--no-sandbox' },
    },
    assert: {
      assertions: {
        // Perf metrics are advisory: one run on a shared CI VM swings
        // TBT/LCP by 100ms+; only determinism-heavy gates block.
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 400 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
