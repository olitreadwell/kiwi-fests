import { SearchBox } from '@/components/search-box';
import { ItemCard } from '@/components/item-card';
import { listItems, recordSearch } from '@/lib/item-repository';
import { getSiteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

/**
 * Server-side fuzzy search over the dataset (Fuse.js). The box lives on
 * the home page and in the nav; results render here.
 *
 * @param props - Page props
 * @param props.searchParams - Query string with q
 * @returns Search results page
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<React.ReactElement> {
  const config = getSiteConfig();
  const { q = '' } = await searchParams;
  const items = q.trim() ? await listItems({ q, limit: 200 }) : [];
  if (q.trim()) await recordSearch(q, items.length);
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">Search {config.thingPlural}</h1>
      <SearchBox defaultValue={q} />
      {q.trim() ? (
        <p className="text-neutral-600 dark:text-neutral-300">
          {items.length} result{items.length === 1 ? '' : 's'} for “{q}”.
        </p>
      ) : (
        <p className="text-neutral-500 dark:text-neutral-400">
          Type a name, suburb, category or keyword.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}
