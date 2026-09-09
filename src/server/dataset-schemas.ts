import { z } from 'zod';
import {
  categoryCountSchema,
  cityCountSchema,
  datasetExportSchema,
  datasetMetaSchema,
  itemSchema,
  slugSchema,
} from '@/data/schema';

/** Query params for GET /api/v1/items and the search endpoint. */
export const v1ItemsQuerySchema = z.object({
  q: z.string().max(200).optional(),
  city: z.string().max(200).optional(),
  category: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

/** Pagination meta block attached to every list response. */
export const listMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});

/** Response envelope for item lists. */
export const itemListResponseSchema = z.object({
  data: z.array(itemSchema),
  meta: listMetaSchema,
});

/** Response envelope for a single item. */
export const itemDetailResponseSchema = z.object({
  data: itemSchema,
});

/** Response envelope for city counts. */
export const cityListResponseSchema = z.object({
  data: z.array(cityCountSchema),
});

/** Response envelope for category counts. */
export const categoryListResponseSchema = z.object({
  data: z.array(categoryCountSchema),
});

/** Response envelope for the full dataset export. */
export const datasetResponseSchema = datasetExportSchema;

/** Response envelope for dataset metadata. */
export const datasetMetaResponseSchema = datasetMetaSchema;

/** Query params for the server-side search endpoint. */
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
});

/** Response envelope for search results. */
export const searchResponseSchema = z.object({
  query: z.string(),
  data: z.array(itemSchema),
});

/** Path params for item detail and view-count routes. */
export const itemPathSchema = z.object({ id: slugSchema });

/** Body of a successful view-count POST. */
export const viewResponseSchema = z.object({
  ok: z.literal(true),
});

/** Body accepted by POST /api/opt-out. */
export const optOutRequestSchema = z.object({
  id: slugSchema,
});

/** Body returned by POST /api/opt-out. */
export const optOutResponseSchema = z.object({
  ok: z.literal(true),
  mode: z.enum(['db', 'snapshot']),
  message: z.string(),
});

/** Body returned by the cron refresh endpoint. */
export const cronResponseSchema = z.object({
  ok: z.boolean(),
  skipped: z.boolean().optional(),
  results: z
    .array(
      z.object({
        source: z.string(),
        status: z.enum(['ok', 'error']),
        itemsFound: z.number(),
        itemsNew: z.number(),
        error: z.string().optional(),
      })
    )
    .optional(),
  error: z.string().optional(),
});

/** Body accepted by POST /api/subscribe. */
export const subscribeRequestSchema = z.object({
  email: z.email(),
});

/** Body returned by POST /api/subscribe and /api/unsubscribe. */
export const subscribeResponseSchema = z.object({
  ok: z.literal(true),
  disabled: z.boolean().optional(),
  message: z.string(),
});
