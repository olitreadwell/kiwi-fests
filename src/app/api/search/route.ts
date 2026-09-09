import { NextResponse } from 'next/server';
import { MAX_ITEM_LIMIT, listItems, recordSearch } from '@/lib/item-repository';
import { toErrorResponse } from '@/lib/errors';
import { searchQuerySchema } from '@/server/dataset-schemas';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search?q=... — fuzzy search across the public dataset. The
 * website search page and the API share this endpoint.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const { q } = searchQuerySchema.parse(Object.fromEntries(url.searchParams));
    const items = await listItems({ q, limit: MAX_ITEM_LIMIT });
    await recordSearch(q, items.length);
    return NextResponse.json({ query: q, data: items });
  } catch (err) {
    return toErrorResponse(err);
  }
}
