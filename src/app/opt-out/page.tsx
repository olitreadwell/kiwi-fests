import { OptOutForm } from '@/components/opt-out-form';
import { getSiteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

/**
 * Opt-out page: how removal works and the request form. Public data only —
 * anyone listed can ask to be removed.
 *
 * @returns Opt-out page
 */
export default function OptOutPage(): React.ReactElement {
  const config = getSiteConfig();
  return (
    <main className="max-w-xl space-y-6">
      <h1 className="text-3xl font-bold">Request removal from {config.name}</h1>
      <p className="text-neutral-600 dark:text-neutral-300">
        Every listing in this directory is public data. If a listing is about you or your
        organisation and you want it gone, submit it below — removal is instant and permanent in
        database deployments, and lands via a fast-track PR on snapshot deployments.
      </p>
      <OptOutForm />
    </main>
  );
}
