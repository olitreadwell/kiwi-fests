import { describe, expect, it, vi } from 'vitest';
import { deliverContactMessage, readContactConfig } from '@/server/contact-service';

const message = { name: 'Ada', email: 'ada@example.com', subject: 'Hi', message: 'Hello world' };

describe('readContactConfig', () => {
  it('resolves smtp config when host is set', () => {
    const config = readContactConfig({
      CONTACT_TO: 'app-contact@ot.mozmail.com',
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_USER: 'user',
      SMTP_PASS: 'pass',
    });
    expect(config.to).toBe('app-contact@ot.mozmail.com');
    expect(config.smtp?.host).toBe('smtp.example.com');
  });

  it('returns null smtp when not configured', () => {
    const config = readContactConfig({ CONTACT_TO: 'x@y.z' });
    expect(config.smtp).toBeNull();
  });
});

describe('deliverContactMessage', () => {
  it('falls back to a mailto link without smtp', async () => {
    const delivery = await deliverContactMessage(
      { to: 'app-contact@ot.mozmail.com', from: 'noreply@x', smtp: null },
      message
    );
    expect(delivery.delivered).toBe('fallback');
    expect(delivery.mailtoUrl).toContain('mailto:app-contact@ot.mozmail.com');
  });

  it('sends via smtp when configured', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: '1' });
    const transportFactory = vi.fn(() => ({ sendMail }));
    const delivery = await deliverContactMessage(
      {
        to: 'app-contact@ot.mozmail.com',
        from: 'noreply@x',
        smtp: { host: 'h', port: 587, user: 'u', pass: 'p' },
      },
      message,
      transportFactory as never
    );
    expect(delivery.delivered).toBe('smtp');
    expect(sendMail).toHaveBeenCalledTimes(1);
  });
});
