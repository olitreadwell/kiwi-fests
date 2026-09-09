import { createTransport } from 'nodemailer';

export interface AuthEmailConfig {
  from: string;
  smtp: { host: string; port: number; user: string; pass: string } | null;
}

export interface AuthEmail {
  to: string;
  subject: string;
  body: string;
}

/**
 * Read auth email config from the environment. SMTP is optional: without
 * it the one-time code is logged (dev mode) so a fresh scaffold works with
 * zero setup.
 *
 * @param env - Process environment (or test object)
 * @returns Resolved auth email config
 */
export function readAuthEmailConfig(env: Record<string, string | undefined>): AuthEmailConfig {
  const host = env.SMTP_HOST;
  return {
    from: env.AUTH_EMAIL_FROM ?? `auth@${host ?? 'localhost'}`,
    smtp: host
      ? {
          host,
          port: Number(env.SMTP_PORT ?? 587),
          user: env.SMTP_USER ?? '',
          pass: env.SMTP_PASS ?? '',
        }
      : null,
  };
}

/**
 * Send an auth email (OTP / magic link) over SMTP, or log it when SMTP is
 * not configured (development default).
 *
 * @param email - Recipient, subject, and body
 * @param config - Auth email config
 * @param transportFactory - Injectable transport factory (defaults to nodemailer)
 */
export async function sendAuthEmail(
  email: AuthEmail,
  config: AuthEmailConfig,
  transportFactory: typeof createTransport = createTransport
): Promise<void> {
  if (config.smtp) {
    const transport = transportFactory({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth:
        config.smtp.user && config.smtp.pass
          ? { user: config.smtp.user, pass: config.smtp.pass }
          : undefined,
    });
    await transport.sendMail({
      from: config.from,
      to: email.to,
      subject: email.subject,
      text: email.body,
    });
    return;
  }
  console.warn(`[auth-email] no SMTP configured (dev) — ${email.subject}: ${email.body}`);
}
