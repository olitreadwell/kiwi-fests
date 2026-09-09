import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getArtistBySlug, listArtists, listCoArtists } from '@/lib/festival-data';
import Breadcrumbs from '@/components/Breadcrumbs';
import { FestivalStatusBadge } from '@/components/FestivalStatusBadge';

export const revalidate = 3600;

export async function generateStaticParams() {
  return listArtists().map((artist) => ({ slug: artist.id }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);
  if (!artist) return { title: 'Artist not found' };
  return {
    title: `${artist.name} — Aotearoa Festivals`,
    description: [artist.genre, artist.homeCity].filter(Boolean).join(' · ') || undefined,
  };
}

export default async function ArtistDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const artist = getArtistBySlug(slug);

  if (!artist) notFound();

  // Group appearances by year
  const byYear = new Map<number, typeof artist.appearances>();
  for (const entry of artist.appearances) {
    const bucket = byYear.get(entry.year) ?? [];
    bucket.push(entry);
    byYear.set(entry.year, bucket);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Artists', href: '/artists' },
          { label: artist.name },
        ]}
      />

      {/* Header */}
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{artist.name}</h1>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground dark:text-muted-foreground">
        {artist.genre && <span>{artist.genre}</span>}
        {artist.homeCity && <span>{artist.homeCity}</span>}
      </div>

      {/* Festival history */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Festival history</h2>
        {years.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground dark:text-muted-foreground">
            No festival appearances recorded yet.
          </p>
        ) : (
          <div className="mt-4 space-y-6">
            {years.map((year) => {
              const entries = byYear.get(year) ?? [];
              return (
                <div key={year}>
                  <h3 className="mb-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase dark:text-muted-foreground">
                    {year}
                  </h3>
                  <ul className="space-y-2">
                    {entries.map((entry) => (
                      <li
                        key={`${entry.festival.id}-${entry.year}`}
                        className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 dark:border-border"
                      >
                        <Link
                          href={`/festivals/${entry.festival.slug}`}
                          className="flex-1 font-medium hover:underline"
                        >
                          {entry.festival.name}
                        </Link>
                        <FestivalStatusBadge status={entry.festival.status} />
                        {entry.isHeadliner && (
                          <span className="shrink-0 rounded-full bg-kowhai-300/40 px-2.5 py-0.5 text-xs font-medium text-kowhai-0 dark:bg-kowhai-100/70 dark:text-kowhai-300">
                            Headliner
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Also played with — co-artists at same festivals */}
      <AlsoPlayedWith artistName={artist.name} />
    </main>
  );
}

async function AlsoPlayedWith({ artistName }: { artistName: string }) {
  const coArtists = listCoArtists(artistName);

  if (coArtists.length === 0) return null;

  return (
    <section className="mt-10 border-t pt-8 dark:border-border">
      <h2 className="text-lg font-semibold tracking-tight">Also played with</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {coArtists.map((a) => (
          <li key={a.id}>
            <a
              href={`/artists/${a.id}`}
              className="inline-block rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-foreground/30 dark:border-border dark:text-muted-foreground dark:hover:border-foreground/30"
            >
              {a.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
