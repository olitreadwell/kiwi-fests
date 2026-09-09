import { NextResponse } from 'next/server';
import { listCities } from '@/lib/item-repository';
import { toErrorResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/** GET /api/v1/cities — city names with listing counts. */
export async function GET(): Promise<Response> {
  try {
    return NextResponse.json({ data: await listCities() });
  } catch (err) {
    return toErrorResponse(err);
  }
}
