import { createTransport } from 'nodemailer';

export interface ContactConfig {
  to: string;
  from: string;
  smtp: { host: string; port: number; user: string; pass: string } | null;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactDelivery {
  delivered: 'smtp' | 'fallback';
  mailtoUrl?: string;
}

/**
 * Read contact configuration from the environment.
 * SMTP is optional: without it the form still validates and answers with a
 * mailto fallback, so a fresh scaffold works with zero setup.
 *
 * @param env - Process environment (or test object)
 * @returns Resolved contact config
 */
export function readContactConfig(env: Record<string, string | undefined>): ContactConfig {
  const to = env.CONTACT_TO ?? '';
  const host = env.SMTP_HOST;
  const smtp = host
    ? {
        host,
        port: Number(env.SMTP_PORT ?? 587),
        user: env.SMTP_USER ?? '',
        pass: env.SMTP_PASS ?? '',
      }
    : null;
  return { to, from: env.CONTACT_FROM ?? `noreply@${host ?? 'localhost'}`, smtp };
}

/**
 * Deliver a contact message by SMTP when configured, else a mailto fallback.
 *
 * @param config - Contact config
 * @param message - Validated form values
 * @param transportFactory - Injectable transport factory (defaults to nodemailer)
 * @returns Delivery outcome
 */
export async function deliverContactMessage(
  config: ContactConfig,
  message: ContactMessage,
  transportFactory: typeof createTransport = createTransport
): Promise<ContactDelivery> {
  if (config.smtp && config.to) {
    const transport = transportFactory({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    });
    await transport.sendMail({
      from: config.from,
      to: config.to,
      replyTo: message.email || undefined,
      subject: `[${message.subject}] from ${message.name}`,
      text: `${message.message}\n\n— ${message.name} <${message.email || 'no email'}>`,
    });
    return { delivered: 'smtp' };
  }
  const params = new URLSearchParams({
    subject: `${message.subject} (from ${message.name})`,
    body: message.message,
  });
  return {
    delivered: 'fallback',
    mailtoUrl: config.to ? `mailto:${config.to}?${params}` : undefined,
  };
}
