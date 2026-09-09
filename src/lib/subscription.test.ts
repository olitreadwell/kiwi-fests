import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleSubscribe, handleUnsubscribe, isEmailSubscribeEnabled } from '@/lib/subscription';

describe('email subscription module', () => {
  afterEach(() => {
    delete process.env.EMAIL_SUBSCRIBE_ENABLED;
    vi.restoreAllMocks();
  });

  it('is off by default', () => {
    expect(isEmailSubscribeEnabled()).toBe(false);
  });

  it('validates the email and records a subscription', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    process.env.EMAIL_SUBSCRIBE_ENABLED = 'true';
    const result = await handleSubscribe({ email: 'ada@example.com' });
    expect(result.message).toContain('recorded');
    expect(logSpy).toHaveBeenCalledWith('subscription:new email=ada@example.com');
  });

  it('answers a disabled-notice when the module is off', async () => {
    const result = await handleSubscribe({ email: 'ada@example.com' });
    expect(result.message).toContain('not enabled');
  });

  it('rejects a bad email and handles unsubscribe', async () => {
    await expect(handleSubscribe({ email: 'nope' })).rejects.toThrow();
    const result = await handleUnsubscribe({ email: 'ada@example.com' });
    expect(result.message).toBe('Unsubscribed.');
  });
});
