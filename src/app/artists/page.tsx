import Link from 'next/link';
import type { Metadata } from 'next';
import { listArtists } from '@/lib/festival-data';
import type { Artist } from '@/lib/festival-types';
import Pagination from '@/components/Pagination';
import Breadcrumbs from '@/components/Breadcrumbs';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: 'All Artists — Aotearoa Festivals',
  description: 'Browse artists who have performed at New Zealand music festivals.',
};

interface PageProps {
  searchParams: Promise<{
    genre?: string;
    city?: string;
    page?: string;
    sort?: string;
  }>;
}

function SocialIcons({ artist }: { artist: Artist }) {
  return artist.homeCity ? (
    <span className="text-xs text-muted-foreground">{artist.homeCity}</span>
  ) : null;
}

export default async function ArtistsPage({ searchParams }: PageProps) {
  const { genre, city, page, sort } = await searchParams;
  const requestedPage = Math.max(1, Math.floor(Number(page)) || 1);
  const sortField = sort === 'genre' || sort === 'city' ? sort : 'name';

  const all = listArtists();
  const filtered = all.filter(
    (a) =>
      (!genre || a.genre?.toLowerCase().includes(genre.toLowerCase())) &&
      (!city || a.homeCity?.toLowerCase().includes(city.toLowerCase()))
  );
  const totalCount = filtered.length;
  const artists = filtered
    .sort((a, b) =>
      (a[sortField as 'name' | 'genre' | 'homeCity'] ?? '').localeCompare(
        b[sortField as 'name' | 'genre' | 'homeCity'] ?? ''
      )
    )
    .slice((requestedPage - 1) * PAGE_SIZE, requestedPage * PAGE_SIZE);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  function pageUrl(p: number): string {
    const params = new URLSearchParams();
    if (genre) params.set('genre', genre);
    if (city) params.set('city', city);
    if (sort && sort !== 'name') params.set('sort', sort);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `/artists?${qs}` : '/artists';
  }

  function sortUrl(field: string): string {
    const params = new URLSearchParams();
    if (genre) params.set('genre', genre);
    if (city) params.set('city', city);
    if (field !== 'name') params.set('sort', field);
    const qs = params.toString();
    return qs ? `/artists?${qs}` : '/artists';
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Artists' }]} />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Artists</h1>
      <p className="mt-1 text-muted-foreground dark:text-muted-foreground">{totalCount} artists</p>

      <div className="mt-6 mb-4 flex flex-wrap items-center gap-3">
        <form method="GET" className="flex gap-2">
          <input type="hidden" name="sort" value={sort ?? ''} />
          <input
            type="text"
            name="genre"
            defaultValue={genre ?? ''}
            placeholder="Genre..."
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm dark:border-border dark:bg-foreground"
          />
          <input
            type="text"
            name="city"
            defaultValue={city ?? ''}
            placeholder="City..."
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm dark:border-border dark:bg-foreground"
          />
          <button
            type="submit"
            className="rounded-lg bg-foreground px-4 py-1.5 text-sm font-medium text-primary-foreground dark:bg-muted dark:text-foreground"
          >
            Filter
          </button>
        </form>
        {(genre || city) && (
          <Link href="/artists" className="text-sm text-primary hover:underline dark:text-primary">
            Clear
          </Link>
        )}
        <div className="ml-auto flex items-center gap-1 text-xs">
          <span className="text-muted-foreground">Sort:</span>
          {[
            { label: 'Name', field: 'name' },
            { label: 'Genre', field: 'genre' },
            { label: 'City', field: 'city' },
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
      </div>

      {artists.length === 0 ? (
        <p className="text-muted-foreground dark:text-muted-foreground">No artists found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border">
                <th className="py-2 pr-4 font-semibold">Name</th>
                <th className="py-2 pr-4 font-semibold">Genre</th>
                <th className="py-2 pr-4 font-semibold">City</th>
                <th className="py-2 font-semibold">Links</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border transition-colors hover:bg-muted/50 dark:border-border dark:hover:bg-muted/50"
                >
                  <td className="py-2.5 pr-4">
                    <Link href={`/artists/${a.id}`} className="font-medium hover:underline">
                      {a.name}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground dark:text-muted-foreground">
                    {a.genre || '—'}
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground dark:text-muted-foreground">
                    {a.homeCity || '—'}
                  </td>
                  <td className="py-2.5">
                    <SocialIcons artist={a} />
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
