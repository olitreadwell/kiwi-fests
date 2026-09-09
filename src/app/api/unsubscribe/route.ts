import { NextResponse } from 'next/server';
import { toErrorResponse } from '@/lib/errors';
import { handleUnsubscribe } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

/**
 * POST /api/unsubscribe — remove an email from the optional list.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const { message } = await handleUnsubscribe(await request.json());
    return NextResponse.json({ ok: true, message });
  } catch (err) {
    return toErrorResponse(err);
  }
}
