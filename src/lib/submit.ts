import type { UnknownRecord } from 'type-fest';
import { solvePowChallenge } from '@/lib/pow-solver';

export interface SubmitResult {
  ok: boolean;
  error?: string;
  status?: number;
  data?: UnknownRecord;
}

/**
 * Solve a fresh proof-of-work challenge and POST the form fields.
 * Shared by the contact and feedback forms.
 *
 * @param endpoint - API path, e.g. /api/contact
 * @param fields - Form fields to submit
 * @returns Submit outcome with parsed JSON
 */
export async function submitWithPow(
  endpoint: string,
  fields: Record<string, string>
): Promise<SubmitResult> {
  const challengeResponse = await fetch('/api/challenge');
  if (!challengeResponse.ok) return { ok: false, error: 'challenge_unavailable' };
  const challenge = (await challengeResponse.json()) as {
    challengeId: string;
    noncePrefix: string;
    difficulty: number;
  };
  const nonce = await solvePowChallenge(challenge);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...fields, challengeId: challenge.challengeId, nonce }),
  });
  const data = (await response.json().catch(() => ({}))) as UnknownRecord;
  if (!response.ok)
    return {
      ok: false,
      error: typeof data.error === 'string' ? data.error : 'request_failed',
      status: response.status,
      data,
    };
  return { ok: true, data };
}
