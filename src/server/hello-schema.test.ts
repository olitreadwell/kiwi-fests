import { describe, expect, it } from 'vitest';
import { helloQuerySchema } from '@/server/hello-schema';

describe('helloQuerySchema', () => {
  it('defaults name to World', () => {
    expect(helloQuerySchema.parse({})).toEqual({ name: 'World' });
  });

  it('trims and enforces length', () => {
    expect(helloQuerySchema.parse({ name: '  Zed  ' })).toEqual({ name: 'Zed' });
    expect(helloQuerySchema.safeParse({ name: '' }).success).toBe(false);
  });
});
