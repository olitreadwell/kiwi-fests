import { describe, expect, it } from 'vitest';
import { authClient } from '@/lib/auth-client';

describe('authClient', () => {
  it('exposes the email OTP methods', () => {
    expect(authClient.emailOtp.sendVerificationOtp).toBeTypeOf('function');
    expect(authClient.emailOtp.verifyEmail).toBeTypeOf('function');
  });
});
