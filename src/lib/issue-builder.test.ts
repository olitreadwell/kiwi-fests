import { describe, expect, it } from 'vitest';
import { buildCommunityIssueUrl } from '@/lib/issue-builder';
import { buildIssuePayload } from '@/lib/issue-builder';

const meta = {
  repo: 'acme/app',
  userAgent: 'test-agent',
  appVersion: '0.1.0',
  reportedAt: '2026-08-26T00:00:00Z',
};

describe('buildIssuePayload', () => {
  it('labels bug reports as bug with full detail', () => {
    const payload = buildIssuePayload(
      {
        type: 'bug',
        title: 'Crash on load',
        description: 'App crashes',
        steps: '1. Open',
        expected: 'Loads',
        actual: 'Crashes',
        page: '/home',
      },
      meta
    );
    expect(payload.labels).toEqual(['bug']);
    expect(payload.title).toBe('Crash on load (bug)');
    expect(payload.body).toContain('## Steps to reproduce');
    expect(payload.body).toContain('test-agent');
    expect(payload.body).toContain('/home');
  });

  it('labels feature requests as enhancement', () => {
    const payload = buildIssuePayload(
      { type: 'feature', title: 'Add export', description: 'Want CSV' },
      meta
    );
    expect(payload.labels).toEqual(['enhancement']);
    expect(payload.body).not.toContain('## Steps to reproduce');
  });

  it('falls back to placeholders for missing detail', () => {
    const payload = buildIssuePayload({ type: 'bug', title: 'x', description: 'y' }, meta);
    expect(payload.body).toContain('_not provided_');
  });
});

describe('buildCommunityIssueUrl', () => {
  const item = { name: 'Example Place One', id: 'example-place-one' };

  it('builds a prefilled add-issue link with the add label', () => {
    const url = new URL(buildCommunityIssueUrl('oli/app', 'add', item));
    expect(url.host).toBe('github.com');
    expect(url.pathname).toBe('/oli/app/issues/new');
    expect(url.searchParams.get('labels')).toBe('add');
    expect(url.searchParams.get('title')).toContain('Example Place One');
  });

  it('builds fix and review links referencing the listing', () => {
    const fix = buildCommunityIssueUrl('oli/app', 'fix', item);
    expect(fix).toContain('labels=fix');
    expect(decodeURIComponent(fix)).toContain('example-place-one');
    const review = buildCommunityIssueUrl('oli/app', 'review', item);
    expect(review).toContain('labels=review');
  });

  it('works without an item for generic adds', () => {
    const url = new URL(buildCommunityIssueUrl('oli/app', 'add', null));
    expect(url.searchParams.get('title')).toContain('new listing');
  });
});
