import { createDocument } from 'zod-openapi';
import { z } from 'zod';
import type { Simplify } from 'type-fest';
import { getSiteConfig } from '@/lib/site-config';
import { helloQuerySchema } from '@/server/hello-schema';
import { contactFormSchema } from '@/server/contact-schema';
import { feedbackFormSchema } from '@/server/feedback-schema';
import {
  categoryListResponseSchema,
  cityListResponseSchema,
  cronResponseSchema,
  datasetMetaResponseSchema,
  datasetResponseSchema,
  itemDetailResponseSchema,
  itemListResponseSchema,
  itemPathSchema,
  optOutRequestSchema,
  optOutResponseSchema,
  searchQuerySchema,
  searchResponseSchema,
  subscribeRequestSchema,
  subscribeResponseSchema,
  v1ItemsQuerySchema,
  viewResponseSchema,
} from '@/server/dataset-schemas';

/**
 * Error envelope shared by every API route. The variants cover the shapes
 * produced by src/lib/errors.ts (validation details) and the route-level
 * guards (rate limit, proof-of-work, honeypot).
 */
export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.record(z.string(), z.array(z.string())).optional(),
  detail: z.string().optional(),
  challenge: z.string().optional(),
  retryAfter: z.number().optional(),
});

/** Body of a successful GET /api/hello response. */
export const helloResponseSchema = z.object({ message: z.string() });

/** Body of a successful GET /api/challenge response. */
export const challengeResponseSchema = z.object({
  challengeId: z.string(),
  noncePrefix: z.string(),
  difficulty: z.number().int(),
  expiresAt: z.number().int(),
});

/** Body of a successful POST /api/contact response. */
export const contactResponseSchema = z.object({
  ok: z.literal(true),
  delivered: z.enum(['smtp', 'fallback']),
  mailtoUrl: z.string().nullable(),
});

/** Body of a successful POST /api/feedback response. */
export const feedbackResponseSchema = z.object({
  ok: z.literal(true),
  url: z.string().optional(),
  disabled: z.boolean().optional(),
  message: z.string().optional(),
});

/** Body of a successful GET /health response. */
export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  uptime: z.number(),
});

const jsonContent = (schema: z.ZodType) => ({
  content: { 'application/json': { schema } },
});

/** API name derived from the site config so scaffolds stay on-brand. */
const apiTitle = `${getSiteConfig().name} API`;

/**
 * OpenAPI 3.1 document for the app's own API routes. Generated from the
 * same zod schemas the routes validate against, so the spec cannot drift
 * from the server. Served at /api/openapi.json and rendered by Swagger UI
 * at /docs. Better Auth's /api/auth/* surface is framework-managed and
 * documented in docs/auth.md instead.
 */
export const openApiDocument: Simplify<ReturnType<typeof createDocument>> = createDocument({
  openapi: '3.1.0',
  info: {
    title: apiTitle,
    version: '0.1.0',
    description:
      'Public API of the open items directory: listings, cities, categories, dataset export (JSON + CSV), search, opt-out and the daily refresh cron. The dataset is zod-validated, publicly sourced, and opt-out respected.',
  },
  servers: [{ url: '/' }],
  paths: {
    '/health': {
      get: {
        summary: 'Liveness check',
        description: 'Load balancers and orchestrators poll this endpoint.',
        responses: {
          '200': { description: 'Service is healthy', ...jsonContent(healthResponseSchema) },
        },
      },
    },
    '/api/hello': {
      get: {
        summary: 'Greet a name',
        description:
          'Demonstrates zod validation at the boundary: bad input never reaches business logic.',
        requestParams: { query: helloQuerySchema },
        responses: {
          '200': { description: 'Greeting', ...jsonContent(helloResponseSchema) },
          '400': { description: 'Invalid query', ...jsonContent(errorResponseSchema) },
        },
      },
    },
    '/api/challenge': {
      get: {
        summary: 'Issue a proof-of-work challenge',
        description:
          'Clients solve the challenge (sha256(noncePrefix + nonce) with difficulty leading zero hex digits) before submitting contact or feedback. Challenges expire after 5 minutes and are single-use.',
        responses: {
          '200': { description: 'Challenge to solve', ...jsonContent(challengeResponseSchema) },
        },
      },
    },
    '/api/contact': {
      post: {
        summary: 'Submit a contact message',
        description:
          'Validates the form, gates abuse (proof of work + rate limit + honeypot), then delivers by SMTP or answers with a mailto fallback. See docs/contact.md for the full contract.',
        requestBody: {
          content: { 'application/json': { schema: contactFormSchema } },
        },
        responses: {
          '200': { description: 'Message accepted', ...jsonContent(contactResponseSchema) },
          '400': {
            description: 'Validation, honeypot, or proof-of-work failure',
            ...jsonContent(errorResponseSchema),
          },
          '429': { description: 'Rate limited', ...jsonContent(errorResponseSchema) },
        },
      },
    },
    '/api/feedback': {
      post: {
        summary: 'Submit feedback',
        description:
          'Validates the form, gates abuse, then files a labelled GitHub issue when GH_TOKEN/GH_REPO are configured; otherwise answers disabled. See docs/contact.md for the full contract.',
        requestBody: {
          content: { 'application/json': { schema: feedbackFormSchema } },
        },
        responses: {
          '200': { description: 'Feedback accepted', ...jsonContent(feedbackResponseSchema) },
          '400': {
            description: 'Validation, honeypot, or proof-of-work failure',
            ...jsonContent(errorResponseSchema),
          },
          '429': { description: 'Rate limited', ...jsonContent(errorResponseSchema) },
        },
      },
    },
    '/api/v1/items': {
      get: {
        tags: ['directory'],
        summary: 'List listings',
        description:
          'Public listings with optional q (fuzzy), city and category filters, plus pagination. Records the query for the self-improvement loop.',
        requestParams: { query: v1ItemsQuerySchema },
        responses: {
          '200': { description: 'List of listings', ...jsonContent(itemListResponseSchema) },
          '400': { description: 'Invalid query', ...jsonContent(errorResponseSchema) },
        },
      },
    },
    '/api/v1/items/[id]': {
      get: {
        tags: ['directory'],
        summary: 'Get one listing',
        description: 'Full listing by slug. 404 when unknown or not public.',
        requestParams: { path: itemPathSchema },
        responses: {
          '200': { description: 'Listing details', ...jsonContent(itemDetailResponseSchema) },
          '404': { description: 'Not found', ...jsonContent(errorResponseSchema) },
        },
      },
    },
    '/api/v1/cities': {
      get: {
        tags: ['directory'],
        summary: 'List cities',
        description: 'City names with listing counts, for browse pages and clients.',
        responses: {
          '200': { description: 'City counts', ...jsonContent(cityListResponseSchema) },
        },
      },
    },
    '/api/v1/categories': {
      get: {
        tags: ['directory'],
        summary: 'List categories',
        description: 'Category labels with listing counts.',
        responses: {
          '200': { description: 'Category counts', ...jsonContent(categoryListResponseSchema) },
        },
      },
    },
    '/api/v1/dataset': {
      get: {
        tags: ['dataset'],
        summary: 'Full dataset export',
        description:
          'Complete dataset as JSON with a content-hash version and ETag. Clients can send If-None-Match to get 304s until the dataset changes.',
        responses: {
          '200': { description: 'Full dataset', ...jsonContent(datasetResponseSchema) },
        },
      },
    },
    '/api/v1/dataset.csv': {
      get: {
        tags: ['dataset'],
        summary: 'Dataset as CSV',
        description: 'Same rows as the JSON export, CSV-escaped, sharing its ETag.',
        responses: {
          '200': {
            description: 'CSV of listings',
            content: { 'text/csv': { schema: { type: 'string' } } },
          },
        },
      },
    },
    '/api/v1/dataset/meta': {
      get: {
        tags: ['dataset'],
        summary: 'Dataset metadata',
        description: 'Version, export time, counts, sources and license for the dataset export.',
        responses: {
          '200': { description: 'Dataset metadata', ...jsonContent(datasetMetaResponseSchema) },
        },
      },
    },
    '/api/search': {
      get: {
        tags: ['directory'],
        summary: 'Search listings',
        description: 'Fuzzy search shared by the website search page and API consumers.',
        requestParams: { query: searchQuerySchema },
        responses: {
          '200': { description: 'Search results', ...jsonContent(searchResponseSchema) },
          '400': { description: 'Missing query', ...jsonContent(errorResponseSchema) },
        },
      },
    },
    '/api/items/[id]/view': {
      post: {
        tags: ['directory'],
        summary: 'Record a listing view',
        description: 'Fire-and-forget view counter powering the self-improvement loop.',
        requestParams: { path: itemPathSchema },
        responses: {
          '200': { description: 'Recorded', ...jsonContent(viewResponseSchema) },
          '404': { description: 'Unknown listing', ...jsonContent(errorResponseSchema) },
        },
      },
    },
    '/api/opt-out': {
      post: {
        tags: ['directory'],
        summary: 'Request listing removal',
        description:
          'Permanent opt-out: DB mode persists immediately; snapshot mode records the request for the community PR gate.',
        requestBody: { content: { 'application/json': { schema: optOutRequestSchema } } },
        responses: {
          '200': { description: 'Removal processed', ...jsonContent(optOutResponseSchema) },
          '404': { description: 'Unknown listing', ...jsonContent(errorResponseSchema) },
          '400': { description: 'Invalid id', ...jsonContent(errorResponseSchema) },
        },
      },
    },
    '/api/cron/refresh': {
      get: {
        tags: ['directory'],
        summary: 'Daily dataset refresh',
        description:
          'Vercel Cron endpoint guarded by CRON_SECRET when set. DB mode scrapes, upserts and logs; snapshot mode reports skipped.',
        responses: {
          '200': { description: 'Refresh outcome', ...jsonContent(cronResponseSchema) },
          '401': { description: 'Missing or bad CRON_SECRET', ...jsonContent(errorResponseSchema) },
        },
      },
    },
    '/api/subscribe': {
      post: {
        tags: ['directory'],
        summary: 'Subscribe to the email list',
        description: 'Optional env-gated email module, off by default.',
        requestBody: { content: { 'application/json': { schema: subscribeRequestSchema } } },
        responses: {
          '200': { description: 'Subscription outcome', ...jsonContent(subscribeResponseSchema) },
          '400': { description: 'Invalid email', ...jsonContent(errorResponseSchema) },
        },
      },
    },
    '/api/unsubscribe': {
      post: {
        tags: ['directory'],
        summary: 'Unsubscribe from the email list',
        responses: {
          '200': { description: 'Unsubscribe outcome', ...jsonContent(subscribeResponseSchema) },
          '400': { description: 'Invalid email', ...jsonContent(errorResponseSchema) },
        },
      },
    },
  },
  tags: [{ name: 'directory', description: 'Open directory listings' }],
});
