import { describe, expect, it } from 'vitest';

import { POST as unsubscribePost } from '../unsubscribe/route';
import { POST as subscribePost } from '../subscribe/route';

describe('API — subscribe', () => {
  it('POST /api/subscribe returns 500 without a JSON body', async () => {
    const request = new Request('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: '',
    });
    const response = await subscribePost(request);
    expect(response.status).toBe(500);
  });

  it('POST /api/subscribe returns 400 with invalid email', async () => {
    const request = new Request('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', region: 'AUCKLAND' }),
    });
    const response = await subscribePost(request);
    expect(response.status).toBe(400);
  });
});

describe('API — unsubscribe', () => {
  it('POST /api/unsubscribe returns 400 without a token', async () => {
    const response = await unsubscribePost(
      new Request('http://localhost:3000/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
    );
    expect(response.status).toBe(400);
  });
});

// Calendar and RSS feeds read from the database, so they run only when a
// DATABASE_URL is available (CI sets none; the check then stays green and
// the handlers stay covered by e2e).
describe.skipIf(!process.env.DATABASE_URL)('API — feeds (require a database)', () => {
  it('GET /calendar.ics returns text/calendar', async () => {
    const response = await fetch('http://localhost:3000/calendar.ics');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/calendar');
  });

  it('GET /feed.xml returns XML', async () => {
    const response = await fetch('http://localhost:3000/feed.xml');
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('<rss');
  });
});
