import { notFound } from 'next/navigation';
import { ItemCard } from '@/components/item-card';
import { listItems } from '@/lib/item-repository';

export const dynamic = 'force-dynamic';

/**
 * Browse listings tagged with one category.
 *
 * @param props - Page props
 * @param props.params - Route params with category
 * @returns Category browse page
 */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<React.ReactElement> {
  const { category } = await params;
  const items = await listItems({ category, limit: 200 });
  if (items.length === 0) notFound();
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">{category}</h1>
      <p className="text-neutral-600 dark:text-neutral-300">
        {items.length} {items.length === 1 ? 'listing' : 'listings'} tagged {category}.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}

/**
 * Static params for the static-export path: categories are generated from
 * the committed snapshot at build time when NEXT_OUTPUT_MODE=export.
 *
 * @returns Snapshot category slugs
 */
export async function generateStaticParams(): Promise<Array<{ category: string }>> {
  if (process.env.NEXT_OUTPUT_MODE !== 'export') return [];
  const { buildExportFromSource } = await import('@/lib/db');
  const dataset = await buildExportFromSource();
  return [...new Set(dataset.items.flatMap((item) => item.categories))].map((category) => ({
    category,
  }));
}
