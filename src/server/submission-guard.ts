import { verifyPowSolution } from '@/lib/pow';
import type { ChallengeId, PowSolution } from '@/lib/pow';
import { FixedWindowRateLimiter, getClientIp } from '@/lib/rate-limit';

export type GuardResult = 'ok' | 'rate_limited' | 'invalid_pow' | 'honeypot';

// Shared per-IP fixed-window limiter for submissions. Values come from env so
// operators can tighten or loosen abuse protection per deploy.
const limitMax = Number(process.env.RATE_LIMIT_MAX ?? 10);
const limitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 3_600_000);
const submissionLimiter = new FixedWindowRateLimiter(limitMax, limitWindowMs);

/**
 * Gate a feedback/contact submission: rate limit by IP, then verify the
 * proof-of-work solution and honeypot. Stops cheap AI/bot hammering while
 * staying solvable by agents that can hash.
 *
 * @param request - Incoming request
 * @param body - Parsed form body (must include challengeId, nonce, website)
 * @returns Guard outcome; 'ok' means the route may proceed
 */
export function guardSubmission(
  request: Request,
  body: { website?: string; challengeId?: string; nonce?: string }
): GuardResult {
  if (body.website) return 'honeypot';
  if (!submissionLimiter.allow(getClientIp(request))) return 'rate_limited';
  // Untrusted strings enter the typed domain here; the branded ChallengeId
  // keeps challenge IDs distinct from nonces inside pow.ts.
  const solution: PowSolution = {
    challengeId: (body.challengeId ?? '') as ChallengeId,
    nonce: body.nonce ?? '',
  };
  if (!verifyPowSolution(solution)) return 'invalid_pow';
  return 'ok';
}
