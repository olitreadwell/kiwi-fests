import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins';
import { randomBytes } from 'node:crypto';
import { authDb, authSchema } from '@/server/db';
import { readAuthEmailConfig, sendAuthEmail } from '@/server/auth-email';

/**
 * Resolve the session signing secret. Required in production; an ephemeral
 * random secret is used in dev when unset (sessions reset on restart).
 *
 * @returns The auth secret
 */
function resolveSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  // `next build` runs with NODE_ENV=production but has no runtime; keep the
  // build green and enforce the secret at boot.
  if (process.env.NEXT_PHASE === 'phase-production-build') return 'build-only-placeholder';
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET must be set in production');
  }
  console.warn('[auth] AUTH_SECRET unset — using an ephemeral dev secret.');
  return randomBytes(32).toString('base64');
}

/**
 * Passwordless auth instance: email OTP sign-in, SQLite persistence,
 * per-IP rate limiting, JWT session cookies.
 */
export const auth = betterAuth({
  database: drizzleAdapter(authDb, { provider: 'sqlite', schema: authSchema }),
  secret: resolveSecret(),
  baseURL: process.env.AUTH_URL ?? 'http://localhost:3000',
  emailAndPassword: { enabled: false },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const config = readAuthEmailConfig(process.env);
        await sendAuthEmail(
          {
            to: email,
            subject: `Your ${type === 'email-verification' ? 'verification' : 'sign-in'} code`,
            body: `Your code is ${otp}. It expires in 5 minutes.`,
          },
          config
        );
      },
      expiresIn: 300,
    }),
  ],
  rateLimit: { enabled: true, window: 60, max: 5 },
  trustedOrigins: (process.env.AUTH_TRUSTED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
});
