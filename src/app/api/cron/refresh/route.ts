import { NextResponse } from 'next/server';
import { hasDatabase, insertScrapeLogs, upsertItemsToDb } from '@/lib/db';
import { runAllScrapers } from '@/lib/scrapers/run-all';

export const maxDuration = 300;

/**
 * GET/POST /api/cron/refresh — daily refresh, fired by Vercel Cron at 2am
 * NZT. Requires `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is
 * set. Snapshot mode reports skipped (the committed snapshot updates via
 * repo runs instead); DB mode runs scrapers, upserts and logs the run.
 */
async function handle(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    if (!hasDatabase()) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    const { results, items } = await runAllScrapers();
    await upsertItemsToDb(items);
    await insertScrapeLogs(results);
    return NextResponse.json({ ok: true, results });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export const GET = handle;
export const POST = handle;
