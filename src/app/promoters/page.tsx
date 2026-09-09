import { listPromoters } from '@/lib/festival-data';
import type { Metadata } from 'next';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import Breadcrumbs from '@/components/Breadcrumbs';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: 'All Promoters — Aotearoa Festivals',
  description: 'Browse promoters and production companies behind New Zealand music festivals.',
};

export default async function PromotersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { page, sort } = await searchParams;
  const requestedPage = Math.max(1, Math.floor(Number(page)) || 1);
  const sortField = sort === 'region' || sort === 'genre' ? sort : 'name';

  const all = listPromoters();
  const totalCount = all.length;
  const promoters = all
    .sort((a, b) =>
      (a[sortField as 'name' | 'region' | 'genre'] ?? '').localeCompare(
        b[sortField as 'name' | 'region' | 'genre'] ?? ''
      )
    )
    .slice((requestedPage - 1) * PAGE_SIZE, requestedPage * PAGE_SIZE);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  function pageUrl(p: number): string {
    const params = new URLSearchParams();
    if (sort && sort !== 'name') params.set('sort', sort);
    if (p > 1) params.set('page', String(p));
    return params.toString() ? `/promoters?${params}` : '/promoters';
  }

  function sortUrl(field: string): string {
    const params = new URLSearchParams();
    if (field !== 'name') params.set('sort', field);
    return params.toString() ? `/promoters?${params}` : '/promoters';
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Promoters' }]} />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Promoters</h1>
      <p className="mt-1 text-muted-foreground dark:text-muted-foreground">
        {totalCount} promoters
      </p>

      <div className="mt-6 mb-4 flex items-center gap-1 text-xs">
        <span className="text-muted-foreground">Sort:</span>
        {[
          { label: 'Name', field: 'name' },
          { label: 'Region', field: 'region' },
          { label: 'Genre', field: 'genre' },
        ].map((s) => (
          <Link
            key={s.field}
            href={sortUrl(s.field)}
            className={`rounded px-2 py-0.5 ${sortField === s.field ? 'bg-muted font-medium dark:bg-muted' : 'hover:underline'}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {promoters.length === 0 ? (
        <p className="text-muted-foreground">No promoters on record yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border">
                <th className="py-2 pr-4 font-semibold">Name</th>
                <th className="py-2 pr-4 font-semibold">Region</th>
                <th className="py-2 pr-4 font-semibold">Genre</th>
                <th className="py-2 pr-4 font-semibold">Festivals</th>
                <th className="py-2 font-semibold">Links</th>
              </tr>
            </thead>
            <tbody>
              {promoters.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border transition-colors hover:bg-muted/50 dark:border-border dark:hover:bg-muted/50"
                >
                  <td className="py-2.5 pr-4">
                    <Link href={`/promoters/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground dark:text-muted-foreground">
                    {p.region || '—'}
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground dark:text-muted-foreground">
                    {p.genre || '—'}
                  </td>
                  <td className="py-2.5 pr-4">{p.festivalCount ?? 0}</td>
                  <td className="py-2.5">
                    <div className="flex gap-2">
                      {p.website && (
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary"
                          title="Website"
                        >
                          WEB
                        </a>
                      )}
                      {p.instagram && (
                        <a
                          href={`https://instagram.com/${p.instagram.replace(/^@/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary"
                          title="Instagram"
                        >
                          IG
                        </a>
                      )}
                      {p.facebook && (
                        <a
                          href={
                            p.facebook.startsWith('http')
                              ? p.facebook
                              : `https://facebook.com/${p.facebook}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary"
                          title="Facebook"
                        >
                          FB
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} buildHref={pageUrl} />
    </main>
  );
}
