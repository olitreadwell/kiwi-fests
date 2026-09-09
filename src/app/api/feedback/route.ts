import { logger } from '@/lib/logger';
import { toErrorResponse } from '@/lib/errors';
import { feedbackFormSchema } from '@/server/feedback-schema';
import { createGithubIssue, readFeedbackConfig } from '@/server/feedback-service';
import { guardSubmission } from '@/server/submission-guard';

/**
 * Submit feedback as a detailed GitHub issue with correct template labels.
 * Disabled (but still validated) when GH_TOKEN/GH_REPO are not configured.
 *
 * @param request - Incoming request with form body
 * @returns Issue URL, or disabled notice
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const parsed = await feedbackFormSchema.safeParseAsync(await request.json());
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
        { error: 'invalid_pow', challenge: 'fetch /api/challenge, then resubmit' },
        { status: 400 }
      );
    }
    if (guard === 'honeypot') {
      return Response.json({ error: 'invalid_submission' }, { status: 400 });
    }

    const config = readFeedbackConfig(process.env);
    if (!config) {
      return Response.json({ ok: true, disabled: true, message: 'issue creation not configured' });
    }
    const outcome = await createGithubIssue(
      {
        type: parsed.data.type,
        title: parsed.data.title,
        description: parsed.data.description,
        steps: parsed.data.steps,
        expected: parsed.data.expected,
        actual: parsed.data.actual,
        page: parsed.data.page,
      },
      request.headers.get('user-agent') ?? 'unknown',
      config
    );
    logger.info({ url: outcome.url }, 'feedback issue created');
    return Response.json({ ok: true, url: outcome.url });
  } catch (error) {
    return toErrorResponse(error);
  }
}
