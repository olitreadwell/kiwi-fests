import { describe, expect, it } from 'vitest';
import { logger } from '@/lib/logger';

describe('logger', () => {
  it('exposes a pino logger', () => {
    expect(logger.level).toBeTruthy();
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('error');
  });
});
