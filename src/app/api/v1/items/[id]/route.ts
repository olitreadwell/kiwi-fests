import { NextResponse } from 'next/server';
import { getItemById } from '@/lib/item-repository';
import { toErrorResponse } from '@/lib/errors';
import { itemPathSchema } from '@/server/dataset-schemas';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/items/{id} — one public listing by slug, 404 when unknown.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = itemPathSchema.parse(await context.params);
    const item = await getItemById(id);
    if (!item) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ data: item });
  } catch (err) {
    return toErrorResponse(err);
  }
}
