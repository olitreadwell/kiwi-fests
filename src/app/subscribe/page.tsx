import { getSiteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

/**
 * Subscribe page for the optional email module (env-gated).
 *
 * @returns Subscribe page
 */
export default function SubscribePage(): React.ReactElement {
  const config = getSiteConfig();
  return (
    <main className="max-w-xl space-y-6">
      <h1 className="text-3xl font-bold">Subscribe to {config.name}</h1>
      <p className="text-neutral-600 dark:text-neutral-300">
        Get an email when new {config.thingPlural} are added or listed details change. The module is
        off by default; projects enable it with EMAIL_SUBSCRIBE_ENABLED=true.
      </p>
      <form action="/api/subscribe" method="post" className="flex gap-2">
        <label htmlFor="subscribe-email" className="sr-only">
          Email address
        </label>
        <input
          id="subscribe-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Subscribe
        </button>
      </form>
    </main>
  );
}
