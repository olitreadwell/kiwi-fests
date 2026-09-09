import { describe, expect, it } from 'vitest';
import { AppError, toErrorResponse } from '@/lib/errors';

describe('toErrorResponse', () => {
  it('maps AppError to its status', async () => {
    const response = toErrorResponse(new AppError('nope', 400));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'nope' });
  });

  it('maps unknown errors to 500', async () => {
    const response = toErrorResponse(new Error('boom'));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'internal_error' });
  });
});
