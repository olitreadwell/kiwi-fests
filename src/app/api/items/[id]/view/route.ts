import { NextResponse } from 'next/server';
import { getItemById, recordItemView } from '@/lib/item-repository';
import { toErrorResponse } from '@/lib/errors';
import { itemPathSchema } from '@/server/dataset-schemas';

export const dynamic = 'force-dynamic';

/**
 * POST /api/items/{id}/view — fire-and-forget view counter used by the
 * detail page. 404 when the item is unknown so bad trackers surface.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = itemPathSchema.parse(await context.params);
    const item = await getItemById(id);
    if (!item) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    await recordItemView(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
