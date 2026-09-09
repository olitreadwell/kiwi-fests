import { createPowChallenge } from '@/lib/pow';

/**
 * Issue a proof-of-work challenge. Clients solve it before submitting
 * contact or feedback (see docs/contact.md for the spec).
 *
 * @returns JSON challenge
 */
export function GET(): Response {
  return Response.json(createPowChallenge(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
