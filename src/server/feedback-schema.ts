import { z } from 'zod';

/** Feedback form contract. POST /api/feedback validates against this. */
export const feedbackFormSchema = z.object({
  type: z.enum(['bug', 'feature', 'general']),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(3).max(5000),
  steps: z.string().trim().max(5000).optional().default(''),
  expected: z.string().trim().max(2000).optional().default(''),
  actual: z.string().trim().max(2000).optional().default(''),
  page: z.string().trim().max(500).optional().default(''),
  // Honeypot: bots fill this; humans leave it empty.
  website: z.string().max(100).optional().default(''),
  challengeId: z.string().min(1).max(128),
  nonce: z.string().min(1).max(128),
});

export type FeedbackForm = z.infer<typeof feedbackFormSchema>;
