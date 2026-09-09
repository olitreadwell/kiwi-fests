import { NextResponse } from 'next/server';
import { listCategories } from '@/lib/item-repository';
import { toErrorResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/** GET /api/v1/categories — category labels with listing counts. */
export async function GET(): Promise<Response> {
  try {
    return NextResponse.json({ data: await listCategories() });
  } catch (err) {
    return toErrorResponse(err);
  }
}
