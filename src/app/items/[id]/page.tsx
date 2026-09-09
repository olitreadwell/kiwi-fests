import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AddToCalendar } from '@/components/add-to-calendar';
import { ItemViewTracker } from '@/components/item-view-tracker';
import { StaleBadge } from '@/components/stale-badge';
import { buildCommunityIssueUrl } from '@/lib/issue-builder';
import { getItemById } from '@/lib/item-repository';
import { getSiteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

/**
 * Metadata for one listing page.
 *
 * @param props - Page props
 * @param props.params - Route params with id
 * @returns Metadata object
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getItemById(id);
  return { title: item?.name ?? 'Listing', description: item?.description ?? undefined };
}

/**
 * Listing detail page: everything known about one listing, with
 * community add/fix/review links and opt-out.
 *
 * @param props - Page props
 * @param props.params - Route params with id
 * @returns Detail page
 */
export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const { id } = await params;
  const item = await getItemById(id);
  if (!item) notFound();
  const config = getSiteConfig();
  const communityLinks = config.ghRepo
    ? {
        add: buildCommunityIssueUrl(config.ghRepo, 'add', item),
        fix: buildCommunityIssueUrl(config.ghRepo, 'fix', item),
        review: buildCommunityIssueUrl(config.ghRepo, 'review', item),
      }
    : null;
  return (
    <main className="max-w-3xl space-y-6">
      <ItemViewTracker itemId={item.id} />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{item.name}</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          {[item.location, item.city, item.region].filter(Boolean).join(' · ')}
        </p>
        {item.categories.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {item.categories.map((category) => (
              <li
                key={category}
                className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                {category}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <StaleBadge item={item} />

      {item.description ? (
        <p className="text-neutral-700 dark:text-neutral-200">{item.description}</p>
      ) : null}
      {item.notes ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.notes}</p>
      ) : null}

      <dl className="grid gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800 sm:grid-cols-2">
        {item.website ? (
          <>
            <dt className="text-sm text-neutral-500 dark:text-neutral-400">Website</dt>
            <dd>
              <a
                href={item.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                {item.website}
              </a>
            </dd>
          </>
        ) : null}
        {item.contact?.email ? (
          <>
            <dt className="text-sm text-neutral-500 dark:text-neutral-400">Email</dt>
            <dd>
              <a
                className="text-blue-600 underline dark:text-blue-400"
                href={`mailto:${item.contact.email}`}
              >
                {item.contact.email}
              </a>
            </dd>
          </>
        ) : null}
        {item.contact?.phone ? (
          <>
            <dt className="text-sm text-neutral-500 dark:text-neutral-400">Phone</dt>
            <dd>{item.contact.phone}</dd>
          </>
        ) : null}
        {item.socials ? (
          <>
            <dt className="text-sm text-neutral-500 dark:text-neutral-400">Socials</dt>
            <dd className="space-x-3">
              {Object.entries(item.socials)
                .filter(([, url]) => typeof url === 'string')
                .map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline dark:text-blue-400"
                  >
                    {platform}
                  </a>
                ))}
            </dd>
          </>
        ) : null}
        <dt className="text-sm text-neutral-500 dark:text-neutral-400">Last verified</dt>
        <dd>
          {item.lastVerified}
          {item.verified ? (
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/50 dark:text-green-200">
              verified
            </span>
          ) : null}
        </dd>
        <dt className="text-sm text-neutral-500 dark:text-neutral-400">Source</dt>
        <dd>
          <a
            href={item.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline dark:text-blue-400"
          >
            {item.source.label}
          </a>
        </dd>
      </dl>

      <AddToCalendar item={item} />

      {item.lat !== undefined && item.lng !== undefined ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Coordinates: {item.lat.toFixed(4)}, {item.lng.toFixed(4)}{' '}
          <a
            href={`https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lng}#map=16/${item.lat}/${item.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline dark:text-blue-400"
          >
            view on OpenStreetMap
          </a>
        </p>
      ) : null}

      <section
        aria-labelledby="community-heading"
        className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
      >
        <h2 id="community-heading" className="font-semibold">
          Help keep this listing right
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Something wrong? Know a better detail? Been here recently? File a prefilled issue — the
          dataset gate (zod + tests) reviews every change.
        </p>
        {communityLinks ? (
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            <li>
              <a className="underline" href={communityLinks.fix}>
                Report wrong info
              </a>
            </li>
            <li>
              <a className="underline" href={communityLinks.review}>
                Review this listing
              </a>
            </li>
            <li>
              <a className="underline" href={communityLinks.add}>
                Suggest a related listing
              </a>
            </li>
          </ul>
        ) : (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Set NEXT_PUBLIC_GH_REPO (via pnpm run setup) to enable community issue links.
          </p>
        )}
        <p className="mt-3 text-sm">
          <a
            href={`/opt-out?id=${encodeURIComponent(item.id)}`}
            className="text-neutral-500 underline dark:text-neutral-400"
          >
            This is my listing — request removal
          </a>
        </p>
      </section>
    </main>
  );
}
