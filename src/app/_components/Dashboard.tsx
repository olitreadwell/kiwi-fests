import Link from 'next/link';
import type { Metadata } from 'next';
import { listFestivals, listMapFestivals } from '@/lib/festival-data';
import { FestivalStatus, Region } from '@/lib/festival-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FestivalStatusBadge } from '@/components/FestivalStatusBadge';
import { PlanStatusSelect } from '@/components/PlanStatusSelect';
import { formatRegion, REGION_LABELS, STATUS_LABELS } from '@/lib/format';
import { Reveal } from '@/components/Reveal';
import HomeMap from './HomeMap';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Aotearoa Festivals — NZ Music Festival Directory',
  description:
    'Discover New Zealand music festivals, promoters, and artists. Browse by region, genre, or status.',
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 px-4 py-3">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-300">
        {label}
      </dt>
      <dd className="tabular mt-1 text-2xl font-semibold tracking-tight">{value}</dd>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    region?: string;
    status?: string;
    genre?: string;
    camping?: string;
    search?: string;
  }>;
}) {
  const { region, status, genre, camping, search } = await searchParams;

  const validRegion =
    region && Object.values(Region).includes(region as Region) ? (region as Region) : undefined;
  const validStatus =
    status && Object.values(FestivalStatus).includes(status as FestivalStatus)
      ? (status as FestivalStatus)
      : undefined;

  const baseWhere = {
    ...(validRegion ? { region: validRegion } : {}),
    ...(validStatus ? { status: validStatus } : {}),
    ...(genre ? { genre } : {}),
    ...(camping ? { camping } : {}),
    ...(search ? { search } : {}),
  };

  const all = listFestivals();
  const festivalCount = all.length;
  const activeCount = all.filter((f) => f.status === FestivalStatus.ACTIVE).length;
  const upcoming = listFestivals(baseWhere).slice(0, 24);
  const mapFestivals = listMapFestivals();
  const regionCount = new Set(all.map((f) => f.region).filter(Boolean)).size;

  const now = new Date();
  const upcomingCount = upcoming.filter(
    (f) => !f.startDate || f.startDate >= now || (!f.startDate && f.status === 'ACTIVE')
  ).length;
  const pastCount = upcoming.length - upcomingCount;
  const hasFilters = Boolean(validRegion || validStatus || genre || camping || search);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-36 left-1/2 h-[30rem] w-[46rem] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl" />
          <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-kowhai-200/30 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-tangaroa-200/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <Reveal>
            <Badge variant="outline" className="gap-2 px-3 text-xs normal-case tracking-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-wao-200" />
              {festivalCount} festivals · {regionCount} regions · NZ music directory
            </Badge>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-7xl">
              Aotearoa&apos;s festivals, one season at a time
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Discover music festivals across New Zealand — browse by region, genre, or date, then
              plan a season that fits.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-3">
              <Stat label="Festivals" value={festivalCount} />
              <Stat label="Active now" value={activeCount} />
              <Stat label="Regions" value={regionCount} />
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 sm:px-6">
        <Reveal>
          <form
            method="GET"
            className="mx-auto max-w-6xl rounded-2xl border border-border bg-card p-3 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_16px_40px_-28px_rgba(28,25,23,0.35)]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Select
                name="region"
                defaultValue={validRegion ?? ''}
                className="min-w-36 flex-1 sm:w-auto sm:flex-none"
                aria-label="Filter by region"
              >
                <option value="">All regions</option>
                {Object.values(Region)
                  .filter((r) => r !== 'ONLINE')
                  .map((r) => (
                    <option key={r} value={r}>
                      {REGION_LABELS[r]}
                    </option>
                  ))}
              </Select>
              <Select
                name="status"
                defaultValue={validStatus ?? ''}
                className="min-w-32 flex-1 sm:w-auto sm:flex-none"
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                {Object.values(FestivalStatus).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
              <Input
                type="text"
                name="genre"
                defaultValue={genre ?? ''}
                placeholder="Genre…"
                className="min-w-28 flex-1 sm:w-auto sm:flex-none"
                aria-label="Filter by genre"
              />
              <Select
                name="camping"
                defaultValue={camping ?? ''}
                className="min-w-32 flex-1 sm:w-auto sm:flex-none"
                aria-label="Filter by camping"
              >
                <option value="">Camping: any</option>
                <option value="yes">Camping: yes</option>
                <option value="no">Camping: no</option>
              </Select>
              <Input
                type="search"
                name="search"
                defaultValue={search ?? ''}
                placeholder="Search…"
                className="min-w-36 flex-1 sm:w-auto sm:flex-none"
                aria-label="Search festivals"
              />
              <Button type="submit" size="sm" variant="secondary">
                Filter
              </Button>
              {hasFilters && (
                <Link
                  href="/"
                  className="px-2 text-xs font-medium text-primary transition-opacity duration-300 ease-out-expo hover:opacity-70"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </Reveal>
      </section>

      {/* Map + List */}
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        <Reveal>
          <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-[0_1px_2px_rgba(28,25,23,0.04),0_24px_48px_-32px_rgba(28,25,23,0.4)] lg:grid-cols-2">
            <div className="lg:border-r lg:border-border">
              <HomeMap
                festivals={mapFestivals.map((f) => ({
                  id: f.id,
                  name: f.name,
                  slug: f.slug,
                  latitude: f.latitude!,
                  longitude: f.longitude!,
                  genre: f.genre,
                  region: f.region,
                  status: f.status,
                }))}
              />
            </div>

            <div className="border-t border-border lg:border-t-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold tracking-tight">
                  <span className="tabular">{upcoming.length}</span> festival
                  {upcoming.length !== 1 ? 's' : ''}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    <span className="tabular">{upcomingCount}</span> upcoming
                    {pastCount > 0 && (
                      <>
                        {' '}
                        · <span className="tabular">{pastCount}</span> past
                      </>
                    )}
                  </span>
                </h2>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/calendar">Calendar view</Link>
                </Button>
              </div>

              <div className="max-h-[70dvh] divide-y divide-border/60 overflow-y-auto">
                {upcoming.map((f) => (
                  <div
                    key={f.id}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors duration-300 ease-out-expo hover:bg-muted/50"
                  >
                    <Link
                      href={`/festivals/${f.slug}`}
                      className="flex min-w-0 flex-1 items-start gap-3"
                    >
                      <FestivalStatusBadge status={f.status} />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold tracking-tight group-hover:underline">
                          {f.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {[f.genre, f.region ? formatRegion(f.region) : null, f.dateText]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                        {f.camping && (
                          <span className="mt-1 inline-block rounded-full bg-muted px-2 py-px text-[10px] font-semibold text-muted-foreground">
                            🏕 Camping
                          </span>
                        )}
                      </div>
                      {f.ticketPrice && (
                        <span className="shrink-0 text-xs font-medium text-muted-foreground">
                          {f.ticketPrice}
                        </span>
                      )}
                    </Link>
                    <PlanStatusSelect slug={f.slug} name={f.name} />
                  </div>
                ))}
                {upcoming.length === 0 && (
                  <p className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No festivals match your filters.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
