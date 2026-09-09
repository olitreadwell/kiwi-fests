// CLI entry point for the scraper framework.
// Usage:
//   pnpm scrape                 run all scrapers against the snapshot (snapshot mode)
//   pnpm scrape --apply         write merged items back to the snapshot and log to logs/scrapes.jsonl
//   DATABASE_URL=... pnpm scrape   run in DB mode (writes items/scrapes tables)
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { runAllScrapers } from '@/lib/scrapers/run-all';
import { hasDatabase } from '@/lib/db';
import type { ScrapeResult } from '@/lib/scrapers/types';

const args = new Set(process.argv.slice(2));
const applyMode = args.has('--apply');

/**
 * Append one run summary to the JSONL scrape log.
 *
 * @param results - Per-source results
 */
function logScrapes(results: ScrapeResult[]): void {
  const logsDir = join(process.cwd(), 'logs');
  mkdirSync(logsDir, { recursive: true });
  const line = JSON.stringify({
    ranAt: new Date().toISOString(),
    mode: hasDatabase() ? 'db' : 'snapshot',
    results,
  });
  appendFileSync(join(logsDir, 'scrapes.jsonl'), `${line}\n`);
}

async function main(): Promise<void> {
  const disabled = new Set(
    (process.env.DISABLED_SOURCES ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const { results, items } = await runAllScrapers({ disabledSources: disabled });
  logScrapes(results);
  if (hasDatabase()) {
    console.log(
      `db mode: ${items.length} items ready; run pnpm db:setup first, then a scraper that writes through SQL`
    );
  }
  if (applyMode) {
    const snapshotPath = join(process.cwd(), 'src', 'data', 'snapshot.json');
    const current = JSON.parse(readFileSync(snapshotPath, 'utf8')) as {
      exportedAt: string;
      version: string;
      license: string;
    };
    writeFileSync(
      snapshotPath,
      `${JSON.stringify({ ...current, exportedAt: new Date().toISOString(), items }, null, 2)}\n`
    );
    console.log(`snapshot updated: ${items.length} items`);
  }
  for (const result of results) {
    const status = result.status === 'ok' ? 'ok  ' : 'FAIL';
    console.log(
      `${status} ${result.source}: ${result.itemsNew} new / ${result.itemsFound} found${result.error ? ` — ${result.error}` : ''}`
    );
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
