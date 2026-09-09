import { describe, expect, it, vi } from 'vitest';
import { readAuthEmailConfig, sendAuthEmail, type AuthEmailConfig } from '@/server/auth-email';

describe('readAuthEmailConfig', () => {
  it('reads SMTP config from the environment', () => {
    const config = readAuthEmailConfig({
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '465',
      SMTP_USER: 'user',
      SMTP_PASS: 'pass',
      AUTH_EMAIL_FROM: 'auth@example.com',
    });
    expect(config).toEqual({
      from: 'auth@example.com',
      smtp: { host: 'smtp.example.com', port: 465, user: 'user', pass: 'pass' },
    });
  });

  it('defaults to a dev-only null SMTP config', () => {
    const config = readAuthEmailConfig({});
    expect(config.smtp).toBeNull();
    expect(config.from).toBe('auth@localhost');
  });
});

describe('sendAuthEmail', () => {
  it('sends over SMTP when configured', async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    const transportFactory = vi.fn().mockReturnValue({ sendMail });
    const config: AuthEmailConfig = {
      from: 'auth@example.com',
      smtp: { host: 'smtp.example.com', port: 587, user: 'u', pass: 'p' },
    };
    await sendAuthEmail(
      { to: 'a@b.com', subject: 'Your sign-in code', body: 'Code: 123456' },
      config,
      transportFactory as never
    );
    expect(sendMail).toHaveBeenCalledWith({
      from: 'auth@example.com',
      to: 'a@b.com',
      subject: 'Your sign-in code',
      text: 'Code: 123456',
    });
  });

  it('logs the code in dev when SMTP is not configured', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const transportFactory = vi.fn();
    const config: AuthEmailConfig = { from: 'auth@localhost', smtp: null };
    await sendAuthEmail(
      { to: 'a@b.com', subject: 'Your sign-in code', body: 'Code: 654321' },
      config,
      transportFactory as never
    );
    expect(transportFactory).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('654321'));
    warn.mockRestore();
  });
});
