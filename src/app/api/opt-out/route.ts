import { NextResponse } from 'next/server';
import { setItemOptOut } from '@/lib/item-repository';
import { hasDatabase } from '@/lib/db';
import { toErrorResponse } from '@/lib/errors';
import { optOutRequestSchema } from '@/server/dataset-schemas';

export const dynamic = 'force-dynamic';

/**
 * POST /api/opt-out — remove a listing from the directory. DB mode
 * persists immediately; snapshot mode records the request for a PR.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = optOutRequestSchema.parse(await request.json());
    const found = await setItemOptOut(body.id);
    if (!found) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const mode = hasDatabase() ? 'db' : 'snapshot';
    return NextResponse.json({
      ok: true,
      mode,
      message:
        mode === 'db'
          ? 'Listing removed. Opt-out is instant and permanent.'
          : 'Opt-out recorded. Snapshot deploys remove listings via the community PR gate (see /opt-out).',
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
