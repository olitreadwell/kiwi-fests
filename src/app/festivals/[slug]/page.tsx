import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { getFestivalBySlug, listAllFestivals } from '@/lib/festival-data';
import type { Festival, LineupEntry, Promoter } from '@/lib/festival-types';
import { formatRegion } from '@/lib/format';
import Breadcrumbs from '@/components/Breadcrumbs';
import { FestivalStatusBadge } from '@/components/FestivalStatusBadge';
import { PlanStatusSelect } from '@/components/PlanStatusSelect';
import { Reveal } from '@/components/Reveal';

export const revalidate = 3600;

export async function generateStaticParams() {
  return listAllFestivals().map((festival) => ({ slug: festival.slug }));
}

// ---------------------------------------------------------------------------
// Types returned from the query
// ---------------------------------------------------------------------------

type LineupEntryWithArtist = LineupEntry;

type FestivalWithRelations = Festival & {
  promoter: Promoter | null;
  lineups: LineupEntryWithArtist[];
};

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const festival = getFestivalBySlug(slug);
  if (!festival) return { title: 'Festival Not Found' };
  return { title: `${festival.name} — Aotearoa Festivals` };
}

function MetaCell({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`bg-card p-5 ${wide ? 'sm:col-span-2' : ''}`}>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-foreground">{children}</dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function FestivalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const festival = getFestivalBySlug(slug) as FestivalWithRelations | null;

  if (!festival) {
    notFound();
  }

  // Similar festivals: same genre or same region, excluding current
  const genreKey = festival.genre?.split(',')[0]?.trim() ?? '';
  const similar = listAllFestivals()
    .filter(
      (f) => f.id !== festival.id && (f.genre?.includes(genreKey) || f.region === festival.region)
    )
    .slice(0, 3)
    .map((f) => ({ id: f.id, name: f.name, slug: f.slug, genre: f.genre, region: f.region }));

  // Group lineup entries by year, descending
  const lineupByYear = new Map<number, LineupEntryWithArtist[]>();
  for (const entry of festival.lineups) {
    const list = lineupByYear.get(entry.year) ?? [];
    list.push(entry);
    lineupByYear.set(entry.year, list);
  }
  const sortedYears = Array.from(lineupByYear.keys()).sort((a, b) => b - a);

  const eyebrow = [festival.region ? formatRegion(festival.region) : null, festival.genre]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Festival',
            name: festival.name,
            ...(festival.startDate && {
              startDate: festival.startDate.toISOString().split('T')[0],
            }),
            ...(festival.endDate && {
              endDate: festival.endDate.toISOString().split('T')[0],
            }),
            ...(festival.location && {
              location: {
                '@type': 'Place',
                name: festival.location,
                ...(festival.region && {
                  address: {
                    '@type': 'PostalAddress',
                    addressRegion: festival.region,
                  },
                }),
              },
            }),
            ...(festival.notes && { description: festival.notes }),
            ...(festival.website && { sameAs: festival.website }),
          }),
        }}
      />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Festivals', href: '/festivals' },
            { label: festival.name },
          ]}
        />

        {/* Header */}
        <header>
          <div className="flex flex-wrap items-center gap-3">
            {eyebrow && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                {eyebrow}
              </p>
            )}
            <FestivalStatusBadge status={festival.status} />
          </div>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl">
            {festival.name}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <PlanStatusSelect slug={festival.slug} name={festival.name} />
            {festival.startDate && (
              <a
                href="./calendar.ics"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--foreground)_3%,transparent)] transition-all duration-300 ease-out-expo hover:border-foreground/25 hover:bg-muted/60 active:scale-[0.98]"
              >
                Add to calendar <span aria-hidden="true">↓</span>
              </a>
            )}
            {festival.website && (
              <a
                href={festival.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground transition-all duration-300 ease-out-expo hover:border-foreground/25 hover:bg-muted/60 active:scale-[0.98]"
              >
                Visit website
                <ArrowUpRight
                  size={13}
                  strokeWidth={2}
                  className="transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            )}
          </div>
        </header>

        {/* Meta grid */}
        <Reveal>
          <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {festival.region && <MetaCell label="Region">{formatRegion(festival.region)}</MetaCell>}
            {festival.location && <MetaCell label="Location">{festival.location}</MetaCell>}
            {festival.genre && <MetaCell label="Genre">{festival.genre}</MetaCell>}
            {festival.camping !== null && festival.camping !== undefined && (
              <MetaCell label="Camping">{festival.camping ? 'Yes — bring a tent' : 'No'}</MetaCell>
            )}
            {festival.dateText && <MetaCell label="Dates">{festival.dateText}</MetaCell>}
            {festival.costText && <MetaCell label="Cost">{festival.costText}</MetaCell>}
            {festival.ticketPrice && (
              <MetaCell label="Tickets">
                {festival.ticketUrl ? (
                  <a
                    href={festival.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary transition-opacity duration-300 ease-out-expo hover:opacity-70"
                  >
                    {festival.ticketPrice} — buy tickets
                    <ArrowUpRight size={13} strokeWidth={2} />
                  </a>
                ) : (
                  festival.ticketPrice
                )}
              </MetaCell>
            )}
            {festival.ticketUrl && !festival.ticketPrice && (
              <MetaCell label="Tickets">
                <a
                  href={festival.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary transition-opacity duration-300 ease-out-expo hover:opacity-70"
                >
                  Buy tickets
                  <ArrowUpRight size={13} strokeWidth={2} />
                </a>
              </MetaCell>
            )}
            {festival.vibe && (
              <MetaCell label="Vibe" wide>
                {festival.vibe}
              </MetaCell>
            )}
          </dl>
        </Reveal>

        {/* Notes */}
        {festival.notes && (
          <Reveal>
            <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-6 text-sm leading-relaxed text-foreground/85 sm:p-8">
              {festival.notes}
            </div>
          </Reveal>
        )}

        {/* Promoter */}
        {festival.promoter && (
          <Reveal>
            <section className="mt-14">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Promoter
              </h2>
              <a
                href={`/promoters/${festival.promoter.id}`}
                className="group mt-3 flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-300 ease-out-expo hover:border-primary/30 hover:shadow-[0_12px_32px_-20px_rgba(163,23,46,0.35)]"
              >
                <span className="text-base font-semibold tracking-tight">
                  {festival.promoter.name}
                </span>
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.75}
                  className="text-muted-foreground transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                />
              </a>
            </section>
          </Reveal>
        )}

        {/* Lineup */}
        {sortedYears.length > 0 && (
          <Reveal>
            <section className="mt-14">
              <h2 className="text-2xl font-bold tracking-[-0.02em]">Lineup</h2>
              <div className="mt-6 space-y-10">
                {sortedYears.map((year) => {
                  const entries = lineupByYear.get(year)!;
                  const headliners = entries.filter((e) => e.isHeadliner);
                  const others = entries.filter((e) => !e.isHeadliner);
                  return (
                    <div key={year}>
                      <h3 className="tabular text-sm font-semibold text-muted-foreground">
                        {year}
                      </h3>
                      {headliners.length > 0 && (
                        <div className="mt-3">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                            Headliners
                          </p>
                          <ul className="flex flex-wrap gap-2">
                            {headliners.map((entry) => (
                              <li key={entry.id}>
                                <a
                                  href={`/artists/${entry.artist.id}`}
                                  className="inline-block rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_6px_16px_-8px_rgba(163,23,46,0.5)] transition-all duration-300 ease-out-expo hover:bg-primary/90 active:scale-[0.98]"
                                >
                                  {entry.artist.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {others.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {others.map((entry) => (
                            <li key={entry.id}>
                              <a
                                href={`/artists/${entry.artist.id}`}
                                className="inline-block rounded-full border border-border bg-background px-4 py-1.5 text-sm text-foreground transition-all duration-300 ease-out-expo hover:border-foreground/30 hover:bg-muted/50 active:scale-[0.98]"
                              >
                                {entry.artist.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </Reveal>
        )}

        {/* Similar festivals */}
        {similar.length > 0 && (
          <Reveal>
            <section className="mt-14 border-t border-border pt-10">
              <h2 className="text-2xl font-bold tracking-[-0.02em]">Similar festivals</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                {similar.map((f) => (
                  <li key={f.id}>
                    <a
                      href={`/festivals/${f.slug}`}
                      className="group flex h-full flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-all duration-300 ease-out-expo hover:border-primary/30 hover:bg-muted/40"
                    >
                      <span className="text-sm font-semibold tracking-tight">{f.name}</span>
                      <span className="flex items-center justify-between text-xs text-muted-foreground">
                        {f.genre}
                        <ArrowUpRight
                          size={13}
                          strokeWidth={1.75}
                          className="transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}
      </main>
    </>
  );
}
