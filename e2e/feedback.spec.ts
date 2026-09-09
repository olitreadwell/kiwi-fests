import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';

function solvePow(noncePrefix: string, difficulty: number): string {
  const target = '0'.repeat(difficulty);
  for (let nonce = 0; nonce < Number.MAX_SAFE_INTEGER; nonce += 1) {
    const digest = createHash('sha256')
      .update(noncePrefix + nonce.toString())
      .digest('hex');
    if (digest.startsWith(target)) return nonce.toString();
  }
  throw new Error('no solution');
}

test('help and contact pages render', async ({ page }) => {
  await page.goto('/help');
  await expect(page.getByRole('heading', { name: 'Help center' })).toBeVisible();
  await page.getByRole('link', { name: 'Contact' }).first().click();
  // Dev-mode first compile of a route can exceed the default 5s expect timeout.
  await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible({ timeout: 15_000 });
});

test('contact rejects a submission without proof of work', async ({ request }) => {
  const response = await request.post('/api/contact', {
    data: { name: 'Ada', subject: 'Hi', message: 'Hello', challengeId: 'x', nonce: '0' },
  });
  expect(response.status()).toBe(400);
});

test('contact accepts a solved submission and falls back to mailto', async ({ request }) => {
  const challenge = (await (await request.get('/api/challenge')).json()) as {
    challengeId: string;
    noncePrefix: string;
    difficulty: number;
  };
  const nonce = solvePow(challenge.noncePrefix, challenge.difficulty);
  const response = await request.post('/api/contact', {
    data: {
      name: 'Ada',
      subject: 'Hello',
      message: 'Hello world',
      challengeId: challenge.challengeId,
      nonce,
    },
  });
  expect(response.status()).toBe(200);
  const body = (await response.json()) as { delivered: string; mailtoUrl: string };
  expect(body.delivered).toBe('fallback');
  expect(body.mailtoUrl).toContain('mailto:test-contact@ot.mozmail.com');
});

test('feedback answers disabled when GitHub is not configured', async ({ request }) => {
  const challenge = (await (await request.get('/api/challenge')).json()) as {
    challengeId: string;
    noncePrefix: string;
    difficulty: number;
  };
  const nonce = solvePow(challenge.noncePrefix, challenge.difficulty);
  const response = await request.post('/api/feedback', {
    data: {
      type: 'bug',
      title: 'Bug here',
      description: 'Details',
      challengeId: challenge.challengeId,
      nonce,
    },
  });
  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({ ok: true, disabled: true });
});
