// DB mode: loads the validated seed dataset into the items table.
// Usage: DATABASE_URL=postgres://... node scripts/seed.mjs
import pg from 'pg';
import { execFileSync } from 'node:child_process';

const { Pool } = pg;

const seedJson = execFileSync(
  process.execPath,
  [
    '--import',
    'tsx',
    '--eval',
    `
      import { seedItems } from ${JSON.stringify(new URL('../src/data/items.ts', import.meta.url).href)};
      process.stdout.write(JSON.stringify(seedItems));
    `,
  ],
  { encoding: 'utf8' }
);
const seedItems = JSON.parse(seedJson);

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required (put it in .env.local).');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
for (const item of seedItems) {
  await pool.query(
    `INSERT INTO items (id, data, last_verified)
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, last_verified = EXCLUDED.last_verified, updated_at = now()`,
    [item.id, item, item.lastVerified]
  );
}
console.log(`Seed loaded: ${seedItems.length} items.`);
await pool.end();
