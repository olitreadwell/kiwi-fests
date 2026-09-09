import { describe, expect, it } from 'vitest';
import { createPowChallenge } from '@/lib/pow';
import { solvePowChallenge } from '@/lib/pow-solver';
import { guardSubmission } from '@/server/submission-guard';

async function solvedBody() {
  const challenge = createPowChallenge(2);
  const nonce = await solvePowChallenge(challenge);
  return { challengeId: challenge.challengeId, nonce };
}

describe('guardSubmission', () => {
  it('passes a solved submission', async () => {
    const body = await solvedBody();
    expect(guardSubmission(new Request('http://localhost'), body)).toBe('ok');
  });

  it('rejects missing or wrong proof of work', () => {
    const request = new Request('http://localhost');
    expect(guardSubmission(request, { challengeId: 'x', nonce: '0' })).toBe('invalid_pow');
  });

  it('rejects honeypot fills', async () => {
    const body = await solvedBody();
    expect(
      guardSubmission(new Request('http://localhost'), { ...body, website: 'http://spam' })
    ).toBe('honeypot');
  });

  it('rate limits after repeated submissions', async () => {
    const request = new Request('http://localhost', { headers: { 'x-forwarded-for': '9.9.9.9' } });
    let sawLimited = false;
    for (let i = 0; i < 11; i += 1) {
      const body = await solvedBody();
      const result = guardSubmission(request, body);
      if (result === 'rate_limited') sawLimited = true;
    }
    expect(sawLimited).toBe(true);
  }, 30_000);
});
