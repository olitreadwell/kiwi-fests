import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitWithPow } from '@/lib/submit';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('submitWithPow', () => {
  it('solves the challenge and submits', async () => {
    const challenge = { challengeId: 'c1', noncePrefix: 'abc', difficulty: 1 };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(challenge)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitWithPow('/api/contact', { name: 'Ada' });
    expect(result.ok).toBe(true);
    const body = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(body.nonce).toBeTruthy();
    expect(body.challengeId).toBe('c1');
  });

  it('surfaces API errors', async () => {
    const challenge = { challengeId: 'c1', noncePrefix: 'abc', difficulty: 1 };
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify(challenge)))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429 })
        )
    );
    const result = await submitWithPow('/api/feedback', { title: 'x' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('rate_limited');
  });
});
