import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkRobots, fetchHtml, respectRateLimit } from '@/lib/scrapers/http';

describe('polite scraper http', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('allows when robots.txt is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('not found', { status: 404 }))
    );
    expect(await checkRobots('https://a.example/page')).toBe(true);
  });

  it('blocks when robots.txt disallows the crawler', async () => {
    const body = `User-agent: *\nDisallow: /private/\n`;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(body, { status: 200 }))
    );
    expect(await checkRobots('https://blocked.example/private/hidden')).toBe(false);
  });

  it('caches robots results per origin', async () => {
    const fetchMock = vi.fn(async () => new Response('', { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await checkRobots('https://cached.example/page')).toBe(true);
    expect(await checkRobots('https://cached.example/other')).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refuses to fetch when robots.txt says no', async () => {
    const body = `User-agent: *\nDisallow: /\n`;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(body, { status: 200 }))
    );
    await expect(fetchHtml('https://denied.example/anything')).rejects.toThrow(
      'Blocked by robots.txt'
    );
  });

  it('surfaces http errors after the retry', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 503 }))
    );
    const promise = fetchHtml('https://error.example/page');
    const assertion = expect(promise).rejects.toThrow('HTTP 503');
    await vi.advanceTimersByTimeAsync(3500);
    await assertion;
  });

  it('fetches HTML with a user agent and retries once on failure', async () => {
    vi.useFakeTimers();
    const fail = (): Promise<Response> => Promise.reject(new Error('network down'));
    const succeed = async (): Promise<Response> => new Response('<html>ok</html>', { status: 200 });
    const fetchMock = vi.fn(fail).mockImplementationOnce(fail).mockImplementationOnce(succeed);
    vi.stubGlobal('fetch', fetchMock);
    const promise = fetchHtml('https://retry.example/page');
    await vi.advanceTimersByTimeAsync(3500);
    const html = await promise;
    expect(html).toContain('<html>');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('respects the per-origin rate limit', async () => {
    vi.useFakeTimers();
    const first = respectRateLimit('https://ratelimit.example/x');
    await vi.advanceTimersByTimeAsync(600);
    await expect(first).resolves.toBeUndefined();
    const second = respectRateLimit('https://ratelimit.example/y');
    await vi.advanceTimersByTimeAsync(600);
    await expect(second).resolves.toBeUndefined();
  });
});
