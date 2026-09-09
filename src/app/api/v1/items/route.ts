import { NextResponse } from 'next/server';
import { MAX_ITEM_LIMIT, countItems, listItems, recordSearch } from '@/lib/item-repository';
import { toErrorResponse } from '@/lib/errors';
import { v1ItemsQuerySchema } from '@/server/dataset-schemas';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/items — list public listings with optional q/city/category
 * filters and pagination. Records the query for the self-improvement loop.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const query = v1ItemsQuerySchema.parse(Object.fromEntries(url.searchParams));
    const [items, total] = await Promise.all([
      listItems({ ...query, limit: MAX_ITEM_LIMIT }),
      countItems(query),
    ]);
    if (query.q) await recordSearch(query.q, items.length);
    const page = items.slice(query.offset, query.offset + query.limit);
    return NextResponse.json({
      data: page,
      meta: { total, limit: query.limit, offset: query.offset },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
