import { NextResponse } from 'next/server';
import { toErrorResponse } from '@/lib/errors';
import { handleSubscribe, isEmailSubscribeEnabled } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

/**
 * POST /api/subscribe — optional email list signup, env-gated off by
 * default (EMAIL_SUBSCRIBE_ENABLED=true). Validates and records.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const { message } = await handleSubscribe(await request.json());
    return NextResponse.json({ ok: true, disabled: !isEmailSubscribeEnabled(), message });
  } catch (err) {
    return toErrorResponse(err);
  }
}
