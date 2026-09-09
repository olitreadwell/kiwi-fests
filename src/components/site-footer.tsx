import Link from 'next/link';
import { getSiteConfig } from '@/lib/site-config';

/** Footer shared by every page: feeds, dataset, community and ethics links. */
export function SiteFooter(): React.ReactElement {
  const config = getSiteConfig();
  return (
    <footer className="border-t border-neutral-200 py-8 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4">
        <p className="mr-auto">
          {config.name} — open directory of {config.thingPlural} in {config.city}.
        </p>
        <Link href="/feed.xml" className="hover:underline">
          RSS
        </Link>
        <Link href="/calendar.ics" className="hover:underline">
          iCal
        </Link>
        <Link href="/api/v1/dataset" className="hover:underline">
          Dataset JSON
        </Link>
        <Link href="/api/v1/dataset.csv" className="hover:underline">
          CSV
        </Link>
        <Link href="/opt-out" className="hover:underline">
          Opt out
        </Link>
        {config.ghRepo ? (
          <Link
            href={`https://github.com/${config.ghRepo}/issues/new?labels=add&title=Add%3A%20new%20listing`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Request a listing
          </Link>
        ) : null}
      </div>
    </footer>
  );
}
