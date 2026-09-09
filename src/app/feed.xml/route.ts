import { Feed } from 'feed';
import { buildExportFromSource } from '@/lib/db';
import { getSiteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

/**
 * GET /feed.xml — RSS feed of new and updated listings. Consumers include
 * aggregators and the community review loop.
 */
export async function GET(): Promise<Response> {
  const config = getSiteConfig();
  const baseUrl = config.baseUrl || 'https://example.com';
  const dataset = await buildExportFromSource();
  const feed = new Feed({
    title: config.name,
    description: `Open directory of ${config.thingPlural} in ${config.city} — ${config.region}.`,
    id: `${baseUrl}/`,
    link: `${baseUrl}/`,
    feedLinks: { rss: `${baseUrl}/feed.xml` },
    copyright: config.name,
    updated: new Date(dataset.exportedAt),
    language: 'en-NZ',
  });
  for (const item of dataset.items) {
    feed.addItem({
      title: item.name,
      id: `${baseUrl}/items/${item.id}`,
      link: `${baseUrl}/items/${item.id}`,
      description:
        [item.description, item.city, item.categories.join(', ')].filter(Boolean).join(' · ') ||
        item.name,
      date: new Date(`${item.lastVerified}T00:00:00Z`),
    });
  }
  return new Response(feed.rss2(), {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
