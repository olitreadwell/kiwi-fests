import { z } from 'zod';

/** Contact form contract. Parsed at the boundary before any logic runs. */
export const contactFormSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200).or(z.literal('')).default(''),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  // Honeypot: bots fill this hidden field; humans leave it empty.
  website: z.string().max(0).optional().default(''),
  challengeId: z.string().min(1).max(128),
  nonce: z.string().min(1).max(128),
});

export type ContactForm = z.infer<typeof contactFormSchema>;
