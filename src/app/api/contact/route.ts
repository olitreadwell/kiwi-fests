import { logger } from '@/lib/logger';
import { toErrorResponse } from '@/lib/errors';
import { contactFormSchema } from '@/server/contact-schema';
import { deliverContactMessage, readContactConfig } from '@/server/contact-service';
import { guardSubmission } from '@/server/submission-guard';

/**
 * Submit a contact message. Validates, gates abuse (PoW + rate limit +
 * honeypot), then delivers by SMTP or answers with a mailto fallback.
 *
 * @param request - Incoming request with JSON body
 * @returns Delivery outcome JSON
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const parsed = contactFormSchema.safeParse(await request.json());
    if (!parsed.success) return toErrorResponse(parsed.error);

    const guard = guardSubmission(request, parsed.data);
    if (guard === 'rate_limited') {
      return Response.json(
        { error: 'rate_limited', retryAfter: 3600 },
        { status: 429, headers: { 'Retry-After': '3600' } }
      );
    }
    if (guard === 'invalid_pow') {
      return Response.json(
        { error: 'invalid_pow', detail: 'fetch /api/challenge, solve, then resubmit' },
        { status: 400 }
      );
    }
    if (guard === 'honeypot') {
      return Response.json({ error: 'invalid_submission' }, { status: 400 });
    }

    const config = readContactConfig(process.env);
    const delivery = await deliverContactMessage(config, {
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
    logger.info({ delivered: delivery.delivered }, 'contact message accepted');
    return Response.json({
      ok: true,
      delivered: delivery.delivered,
      mailtoUrl: delivery.mailtoUrl ?? null,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
