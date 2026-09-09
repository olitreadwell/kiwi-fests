import { notFound } from 'next/navigation';
import { ItemCard } from '@/components/item-card';
import { listItems } from '@/lib/item-repository';

export const dynamic = 'force-dynamic';

/**
 * Browse listings in one city.
 *
 * @param props - Page props
 * @param props.params - Route params with city
 * @returns City browse page
 */
export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<React.ReactElement> {
  const { city } = await params;
  const items = await listItems({ city, limit: 200 });
  if (items.length === 0) notFound();
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">{city}</h1>
      <p className="text-neutral-600 dark:text-neutral-300">
        {items.length} {items.length === 1 ? 'listing' : 'listings'}.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}
