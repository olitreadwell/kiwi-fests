import { NextResponse } from 'next/server';
import { buildExportFromSource } from '@/lib/db';
import { toErrorResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/dataset — full dataset export as JSON with an ETag derived
 * from the content hash, so clients cache until the dataset actually
 * changes (304 round-trip tested by the contract test).
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const dataset = await buildExportFromSource();
    const etag = `"${dataset.version}"`;
    if (request.headers.get('if-none-match') === etag) {
      return new Response(null, {
        status: 304,
        headers: { etag, 'cache-control': 'public, max-age=3600' },
      });
    }
    return NextResponse.json(dataset, {
      headers: { etag, 'cache-control': 'public, max-age=3600' },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
