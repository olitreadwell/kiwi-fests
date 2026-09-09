import { describe, expect, it } from 'vitest';
import { contactFormSchema } from '@/server/contact-schema';

const base = { name: 'Ada', subject: 'Hello', message: 'Hi there', challengeId: 'c', nonce: 'n' };

describe('contactFormSchema', () => {
  it('accepts a valid form', () => {
    expect(contactFormSchema.parse(base).email).toBe('');
  });

  it('rejects empty message', () => {
    expect(contactFormSchema.safeParse({ ...base, message: ' ' }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(contactFormSchema.safeParse({ ...base, email: 'nope' }).success).toBe(false);
  });
});
