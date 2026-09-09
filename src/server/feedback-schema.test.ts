import { describe, expect, it } from 'vitest';
import { feedbackFormSchema } from '@/server/feedback-schema';

const base = {
  type: 'bug',
  title: 'It broke',
  description: 'Details',
  challengeId: 'c',
  nonce: 'n',
};

describe('feedbackFormSchema', () => {
  it('accepts a valid bug report', () => {
    expect(feedbackFormSchema.parse(base).type).toBe('bug');
  });

  it('rejects unknown feedback type', () => {
    expect(feedbackFormSchema.safeParse({ ...base, type: 'spam' }).success).toBe(false);
  });

  it('rejects a title that is too short', () => {
    expect(feedbackFormSchema.safeParse({ ...base, title: 'x' }).success).toBe(false);
  });
});
