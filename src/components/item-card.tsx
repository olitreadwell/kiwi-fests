import Link from 'next/link';
import type { Item } from '@/data/schema';
import { isStale } from '@/lib/stale';

/** A compact listing card used on browse and home pages. */
export function ItemCard({ item }: { item: Item }): React.ReactElement {
  const stale = isStale(item);
  return (
    <article className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-50">
          <Link href={`/items/${item.id}`} className="hover:underline">
            {item.name}
          </Link>
        </h2>
        {stale ? (
          <span
            className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
            title="Last verified a while ago — see the listing page to verify"
          >
            needs check
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {[item.location, item.city, ...item.categories].filter(Boolean).join(' · ')}
      </p>
      {item.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
          {item.description}
        </p>
      ) : null}
    </article>
  );
}
