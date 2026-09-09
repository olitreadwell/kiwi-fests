import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { IsEqual } from 'type-fest';
import { z } from 'zod';
import { GET as getChallenge } from '@/app/api/challenge/route';
import { POST as postContact } from '@/app/api/contact/route';
import { POST as postFeedback } from '@/app/api/feedback/route';
import { GET as getHello } from '@/app/api/hello/route';
import { GET as getHealth } from '@/app/health/route';
import type { FeedbackType } from '@/lib/issue-builder';
import { createPowChallenge } from '@/lib/pow';
import { solvePowChallenge } from '@/lib/pow-solver';
import type { HelloQuery } from '@/server/hello-schema';
import {
  challengeResponseSchema,
  contactResponseSchema,
  errorResponseSchema,
  feedbackResponseSchema,
  healthResponseSchema,
  helloResponseSchema,
  openApiDocument,
} from '@/server/openapi';

// Routes managed by Better Auth and the spec endpoint itself are not
// hand-documented in the OpenAPI document.
const EXCLUDED_ROUTES = new Set(['/api/auth/*', '/api/openapi.json']);

function collectRoutePaths(): string[] {
  const apiRoot = join(process.cwd(), 'src/app/api');
  const paths: string[] = [];
  const walk = (dir: string, prefix: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full, `${prefix}/${entry}`);
      } else if (entry === 'route.ts') {
        paths.push(prefix);
      }
    }
  };
  walk(apiRoot, '/api');
  const healthRoute = join(process.cwd(), 'src/app/health/route.ts');
  if (statSync(healthRoute, { throwIfNoEntry: false })?.isFile()) paths.push('/health');
  return paths.map((path) => path.replace(/\[\.\.\.all\]/, '*'));
}

async function solvedSubmission(): Promise<{ challengeId: string; nonce: string }> {
  const challenge = createPowChallenge(2);
  const nonce = await solvePowChallenge(challenge);
  return { challengeId: challenge.challengeId, nonce };
}

describe('OpenAPI contract', () => {
  it('is a valid OpenAPI 3.1 document listing every app route', () => {
    expect(openApiDocument.openapi).toBe('3.1.0');
    expect(openApiDocument.info.title).toBeTruthy();
    expect(openApiDocument.info.version).toBeTruthy();
    for (const path of [
      '/health',
      '/api/hello',
      '/api/challenge',
      '/api/contact',
      '/api/feedback',
    ]) {
      expect(openApiDocument.paths?.[path]).toBeDefined();
    }
  });

  it('documents every route handler and vice versa (no drift)', () => {
    const documented = new Set(Object.keys(openApiDocument.paths ?? {}));
    const routes = collectRoutePaths();
    for (const routePath of routes) {
      if (EXCLUDED_ROUTES.has(routePath)) continue;
      expect(documented.has(routePath), `route ${routePath} is missing from the OpenAPI spec`).toBe(
        true
      );
    }
    for (const path of documented) {
      if (EXCLUDED_ROUTES.has(path)) continue;
      expect(routes.includes(path), `spec path ${path} has no route handler`).toBe(true);
    }
  });

  it('GET /api/hello answers per the spec', async () => {
    const response = getHello(new Request('http://localhost/api/hello?name=Ada'));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(helloResponseSchema.safeParse(body).success).toBe(true);
  });

  it('GET /api/hello rejects bad input per the spec', async () => {
    const response = getHello(new Request('http://localhost/api/hello?name='));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(errorResponseSchema.safeParse(body).success).toBe(true);
  });

  it('GET /api/challenge answers per the spec', async () => {
    const response = getChallenge();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(challengeResponseSchema.safeParse(body).success).toBe(true);
  });

  it('GET /health answers per the spec', async () => {
    const response = getHealth();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(healthResponseSchema.safeParse(body).success).toBe(true);
  });

  it('POST /api/contact answers per the spec', async () => {
    const { challengeId, nonce } = await solvedSubmission();
    const response = await postContact(
      new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Ada',
          email: '',
          subject: 'Hello',
          message: 'Hello world',
          challengeId,
          nonce,
        }),
      })
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(contactResponseSchema.safeParse(body).success).toBe(true);
  });

  it('POST /api/contact rejects without proof of work per the spec', async () => {
    const response = await postContact(
      new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Ada',
          subject: 'Hi',
          message: 'Hello',
          challengeId: 'x',
          nonce: '0',
        }),
      })
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(errorResponseSchema.safeParse(body).success).toBe(true);
  });

  it('POST /api/feedback answers per the spec', async () => {
    const { challengeId, nonce } = await solvedSubmission();
    const response = await postFeedback(
      new Request('http://localhost/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bug',
          title: 'Bug here',
          description: 'Details',
          challengeId,
          nonce,
        }),
      })
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(feedbackResponseSchema.safeParse(body).success).toBe(true);
  });

  it('POST /api/feedback rejects without proof of work per the spec', async () => {
    const response = await postFeedback(
      new Request('http://localhost/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bug',
          title: 'Bug',
          description: 'Details',
          challengeId: 'x',
          nonce: '0',
        }),
      })
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(errorResponseSchema.safeParse(body).success).toBe(true);
  });

  it('keeps the hello query type in sync with the spec', () => {
    const matches: IsEqual<HelloQuery, { name: string }> = true;
    expect(matches).toBe(true);
  });

  it('keeps the feedback type in sync with the spec', () => {
    const matches: IsEqual<FeedbackType, 'bug' | 'feature' | 'general'> = true;
    expect(matches).toBe(true);
  });

  it('keeps the hello response type in sync with the spec', () => {
    const matches: IsEqual<z.infer<typeof helloResponseSchema>, { message: string }> = true;
    expect(matches).toBe(true);
  });
});
