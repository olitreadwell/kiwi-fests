import { MapView } from '@/components/map-view';
import { listItems } from '@/lib/item-repository';
import { getSiteConfig } from '@/lib/site-config';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

/**
 * Interactive map of all listings with coordinates.
 *
 * @returns Map page
 */
export default async function MapPage(): Promise<React.ReactElement> {
  const config = getSiteConfig();
  const items = await listItems({ limit: 200 });
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">{config.name} map</h1>
      <p className="text-neutral-600 dark:text-neutral-300">
        Approximate positions from listing coordinates. Use the link list below to jump to any
        listing.
      </p>
      <MapView items={items} region={config.region} />
      <nav aria-label="Listings on this map" className="flex flex-wrap gap-3 text-sm">
        {items
          .filter((item) => item.lat !== undefined && item.lng !== undefined)
          .map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="text-blue-600 underline dark:text-blue-400"
            >
              {item.name}
            </Link>
          ))}
      </nav>
    </main>
  );
}
