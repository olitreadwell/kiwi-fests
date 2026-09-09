import { NextResponse } from 'next/server';
import { buildDatasetMeta } from '@/lib/dataset';
import { buildExportFromSource } from '@/lib/db';
import { toErrorResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/** GET /api/v1/dataset/meta — version, counts, sources and license. */
export async function GET(): Promise<Response> {
  try {
    const dataset = await buildExportFromSource();
    return NextResponse.json(buildDatasetMeta(dataset), {
      headers: { 'cache-control': 'public, max-age=3600' },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
