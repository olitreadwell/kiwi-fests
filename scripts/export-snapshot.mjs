#!/usr/bin/env node
// DB mode: exports the live dataset to the committed src/data/snapshot.json
// so a checkout of the repo always carries a recent public snapshot.
// Usage: DATABASE_URL=... node scripts/export-snapshot.mjs
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { format } from 'prettier';

const out = execFileSync(
  process.execPath,
  [
    '--import',
    'tsx',
    '--eval',
    `
      import { buildExportFromSource } from ${JSON.stringify(new URL('../src/lib/db.ts', import.meta.url).href)};
      buildExportFromSource().then((dataset) => process.stdout.write(JSON.stringify(dataset, null, 2)));
    `,
  ],
  { encoding: 'utf8' }
);
const formatted = await format(out.trim(), { parser: 'json' });
writeFileSync(new URL('../src/data/snapshot.json', import.meta.url), formatted);
console.log('Snapshot exported from database.');
