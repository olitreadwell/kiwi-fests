import { ItemCard } from '@/components/item-card';
import { listItems } from '@/lib/item-repository';
import { getSiteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

/**
 * Browse all listings, newest-verified first, capped at 200.
 *
 * @param props - Page props
 * @param props.searchParams - Query string
 * @returns Browse page
 */
export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; category?: string }>;
}): Promise<React.ReactElement> {
  const config = getSiteConfig();
  const params = await searchParams;
  const items = await listItems({
    city: params.city,
    category: params.category,
    limit: 200,
  });
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">
        All {config.thingPlural}
        {params.city ? ` in ${params.city}` : ''}
        {params.category ? ` — ${params.category}` : ''}
      </h1>
      <p className="text-neutral-600 dark:text-neutral-300">
        {items.length} {items.length === 1 ? 'listing' : 'listings'} shown.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
      {items.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400">No listings match yet.</p>
      ) : null}
    </main>
  );
}
