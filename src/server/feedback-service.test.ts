import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGithubIssue, readFeedbackConfig } from '@/server/feedback-service';

const config = { token: 't', repo: 'acme/app', appVersion: '0.1.0' };
const input = {
  type: 'bug' as const,
  title: 'Crash',
  description: 'It crashes',
  steps: '1',
  expected: 'ok',
  actual: 'boom',
  page: '/home',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('readFeedbackConfig', () => {
  it('returns null when token or repo missing', () => {
    expect(readFeedbackConfig({})).toBeNull();
    expect(readFeedbackConfig({ GH_TOKEN: 't' })).toBeNull();
  });

  it('reads token and repo', () => {
    const parsed = readFeedbackConfig({ GH_TOKEN: 't', GH_REPO: 'acme/app' });
    expect(parsed?.repo).toBe('acme/app');
  });
});

describe('createGithubIssue', () => {
  it('creates an issue and returns its URL', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ html_url: 'https://github.com/acme/app/issues/1' }), {
          status: 201,
        })
    );
    vi.stubGlobal('fetch', fetchMock);
    const outcome = await createGithubIssue(input, 'test-ua', config);
    expect(outcome.url).toBe('https://github.com/acme/app/issues/1');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/repos/acme/app/issues'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('throws when GitHub rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 422 }))
    );
    await expect(createGithubIssue(input, 'test-ua', config)).rejects.toThrow(/422/);
  });
});
