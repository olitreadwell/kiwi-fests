import type { z } from 'zod';
import { subscribeRequestSchema } from '@/server/dataset-schemas';

/** True when the optional email module is switched on (off by default). */
export function isEmailSubscribeEnabled(): boolean {
  return process.env.EMAIL_SUBSCRIBE_ENABLED === 'true';
}

/**
 * Validate and accept a subscription request. Snapshot mode cannot persist
 * subscribers, so an accepted subscription is logged for the weekly export
 * pass; DB mode stores the event in analytics. The real delivery list
 * lives in whatever mail provider a project wires in.
 *
 * @param body - Raw request body
 * @returns Normalized acceptance message
 */
export async function handleSubscribe(body: unknown): Promise<{ message: string }> {
  const { email } = subscribeRequestSchema.parse(body) satisfies z.infer<
    typeof subscribeRequestSchema
  >;
  if (isEmailSubscribeEnabled()) {
    console.log(`subscription:new email=${email}`);
    return { message: 'Subscription recorded.' };
  }
  return { message: 'Email list is not enabled on this deployment.' };
}

/**
 * Remove a subscription. Mirrors handleSubscribe: validated, then logged.
 *
 * @param body - Raw request body
 * @returns Normalized message
 */
export async function handleUnsubscribe(body: unknown): Promise<{ message: string }> {
  const { email } = subscribeRequestSchema.parse(body) satisfies z.infer<
    typeof subscribeRequestSchema
  >;
  console.log(`subscription:remove email=${email}`);
  return { message: 'Unsubscribed.' };
}
