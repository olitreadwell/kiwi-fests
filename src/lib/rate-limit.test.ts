import { describe, expect, it } from 'vitest';
import { FixedWindowRateLimiter, getClientIp } from '@/lib/rate-limit';

describe('FixedWindowRateLimiter', () => {
  it('allows up to max and blocks beyond', () => {
    const limiter = new FixedWindowRateLimiter(2, 60_000);
    expect(limiter.allow('a')).toBe(true);
    expect(limiter.allow('a')).toBe(true);
    expect(limiter.allow('a')).toBe(false);
  });

  it('tracks keys independently', () => {
    const limiter = new FixedWindowRateLimiter(1, 60_000);
    expect(limiter.allow('a')).toBe(true);
    expect(limiter.allow('b')).toBe(true);
    expect(limiter.allow('a')).toBe(false);
  });

  it('resets after the window', async () => {
    const limiter = new FixedWindowRateLimiter(1, 10);
    limiter.allow('a');
    await new Promise((resolve) => setTimeout(resolve, 12));
    expect(limiter.allow('a')).toBe(true);
    expect(limiter.allow('a')).toBe(false);
  });
});

describe('getClientIp', () => {
  it('reads x-forwarded-for first value', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(request)).toBe('1.2.3.4');
  });

  it('falls back to unknown', () => {
    expect(getClientIp(new Request('http://localhost'))).toBe('unknown');
  });
});
