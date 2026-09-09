import { describe, expect, it } from 'vitest';
import { auth } from '@/server/auth';

describe('auth instance', () => {
  it('boots with the email OTP plugin and no session by default', async () => {
    expect(auth).toBeDefined();
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: '' }),
    });
    expect(session).toBeNull();
  });
});
