import { isStale } from '@/lib/stale';
import type { Item } from '@/data/schema';

/** Warning badge plus verification prompt when a listing is stale. */
export function StaleBadge({ item }: { item: Item }): React.ReactElement | null {
  if (!isStale(item)) return null;
  return (
    <p className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
      This listing was last verified {item.lastVerified}. Details may have changed — please
      double-check before you rely on it.
    </p>
  );
}
