#!/usr/bin/env node
// Regenerates src/data/snapshot.json from the validated seed in src/data/items.ts.
// The snapshot is the committed artifact every read path serves in snapshot mode.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { format } from 'prettier';

// Load the TS seed through tsx so this script needs no separate build step.
const out = execFileSync(
  process.execPath,
  [
    '--import',
    'tsx',
    '--eval',
    `
    import { seedItems } from ${JSON.stringify(new URL('../src/data/items.ts', import.meta.url).href)};
    const exportBody = {
      version: "seed",
      exportedAt: new Date().toISOString(),
      license: "Public data only. Opt-out respected — see /opt-out.",
      items: seedItems.map((i) => ({
        ...i,
        categories: i.categories ?? [],
        verified: i.verified ?? false,
        active: i.active ?? true,
        optOut: i.optOut ?? false,
        calendarDates: i.calendarDates ?? [],
      })),
    };
    process.stdout.write(JSON.stringify(exportBody, null, 2));
  `,
  ],
  { encoding: 'utf8' }
);

const prettierRc = JSON.parse(
  readFileSync(new URL('../.prettierrc.json', import.meta.url), 'utf8')
);
const formatted = await format(out.trim(), { parser: 'json', ...prettierRc });
const snapshotPath = new URL('../src/data/snapshot.json', import.meta.url);
writeFileSync(snapshotPath, formatted);
console.log(`Snapshot written (prettier-formatted): ${snapshotPath.pathname}`);
