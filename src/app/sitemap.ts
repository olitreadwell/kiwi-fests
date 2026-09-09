import type { MetadataRoute } from 'next';
import { buildExportFromSource } from '@/lib/db';
import { listCategories, listCities } from '@/lib/item-repository';
import { getSiteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

/**
 * Dynamic sitemap: home, browse, search, opt-out plus every item, city and
 * category page. Reflects the dataset at request time so new listings
 * appear in search indexes the same day they land.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = getSiteConfig();
  const baseUrl = config.baseUrl || 'https://example.com';
  const [dataset, cities, categories] = await Promise.all([
    buildExportFromSource(),
    listCities(),
    listCategories(),
  ]);
  const staticRoutes = ['', '/items', '/search', '/map', '/opt-out'].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));
  return [
    ...staticRoutes,
    ...dataset.items.map((item) => ({
      url: `${baseUrl}/items/${item.id}`,
      lastModified: new Date(`${item.lastVerified}T00:00:00Z`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...cities.map((city) => ({
      url: `${baseUrl}/cities/${encodeURIComponent(city.city)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...categories.map((category) => ({
      url: `${baseUrl}/categories/${encodeURIComponent(category.category)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
