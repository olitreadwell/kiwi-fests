import { describe, expect, it } from 'vitest';
import {
  itemPathSchema,
  optOutRequestSchema,
  searchQuerySchema,
  subscribeRequestSchema,
  v1ItemsQuerySchema,
} from '@/server/dataset-schemas';

describe('dataset API schemas', () => {
  it('parses list query params with defaults and coercion', () => {
    expect(v1ItemsQuerySchema.parse({ q: 'hello', city: 'Wellington' })).toMatchObject({
      q: 'hello',
      city: 'Wellington',
      limit: 50,
      offset: 0,
    });
    expect(v1ItemsQuerySchema.parse({ limit: '10', offset: '5' })).toMatchObject({
      limit: 10,
      offset: 5,
    });
  });

  it('rejects invalid query params', () => {
    expect(v1ItemsQuerySchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(v1ItemsQuerySchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it('validates slug path and body ids', () => {
    expect(itemPathSchema.parse({ id: 'example-place-one' })).toEqual({ id: 'example-place-one' });
    expect(itemPathSchema.safeParse({ id: 'Bad ID' }).success).toBe(false);
    expect(optOutRequestSchema.safeParse({ id: 'example-place-one' }).success).toBe(true);
  });

  it('requires a non-empty search query and a real email', () => {
    expect(searchQuerySchema.safeParse({ q: '' }).success).toBe(false);
    expect(searchQuerySchema.parse({ q: 'thrift' })).toEqual({ q: 'thrift' });
    expect(subscribeRequestSchema.safeParse({ email: 'nope' }).success).toBe(false);
    expect(subscribeRequestSchema.parse({ email: 'ada@example.com' })).toEqual({
      email: 'ada@example.com',
    });
  });
});
