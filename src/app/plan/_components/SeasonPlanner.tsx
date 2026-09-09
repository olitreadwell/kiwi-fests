'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Layers, Plus, Sparkles, Tent, Users } from 'lucide-react';
import type { PlanFestivalWithStatus } from '../page';
import {
  buildFestivalItinerary,
  festivalDurationDays,
  type PlanStrategy,
} from '@/lib/plan-optimizer';
import { formatDateRange, formatRegion } from '@/lib/format';
import { useFestivalPlan } from '@/hooks/useFestivalPlan';
import { FestivalStatusBadge } from '@/components/FestivalStatusBadge';
import { PlanStatusSelect } from '@/components/PlanStatusSelect';
import { Reveal } from '@/components/Reveal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const STRATEGIES: Array<{
  value: PlanStrategy;
  label: string;
  description: string;
  icon: typeof Users;
}> = [
  {
    value: 'most',
    label: 'Most festivals',
    description: 'Maximise how many you can hit',
    icon: Layers,
  },
  {
    value: 'biggest',
    label: 'Biggest crowds',
    description: 'The big ones — most attendees',
    icon: Users,
  },
  {
    value: 'indie',
    label: 'Small & intimate',
    description: 'Boutique festivals, tight-knit crowds',
    icon: Sparkles,
  },
];

const REGION_LABELS: Record<'all' | 'north' | 'south', string> = {
  all: 'All of NZ',
  north: 'North Island',
  south: 'South Island',
};

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </span>
  );
}

function parsedMinDays(value: string): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export default function SeasonPlanner({ festivals }: { festivals: PlanFestivalWithStatus[] }) {
  const [strategy, setStrategy] = useState<PlanStrategy>('most');
  const [region, setRegion] = useState<'all' | 'north' | 'south'>('all');
  const [genre, setGenre] = useState('');
  const [camping, setCamping] = useState<'any' | 'yes' | 'no'>('any');
  const [minDays, setMinDays] = useState('');
  const [maxCount, setMaxCount] = useState('');
  const { setStatus } = useFestivalPlan();

  const itinerary = useMemo(() => {
    const parsedMax = maxCount ? Number(maxCount) : undefined;
    return buildFestivalItinerary(festivals, {
      strategy,
      region,
      genre: genre || undefined,
      camping,
      minDays: parsedMinDays(minDays),
      maxCount: parsedMax && parsedMax > 0 ? parsedMax : undefined,
    });
  }, [festivals, strategy, region, genre, camping, minDays, maxCount]);

  function addAllToPlan() {
    for (const festival of itinerary) {
      setStatus(festival.slug, 'planned');
    }
  }

  const firstDate = itinerary[0]?.startDate;
  const lastDate = itinerary[itinerary.length - 1]?.startDate;

  return (
    <Reveal>
      <section
        id="season-builder"
        aria-labelledby="season-builder-title"
        className="relative mb-16 overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_24px_48px_-28px_rgba(28,25,23,0.3)] sm:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Season builder
            </p>
            <h2 id="season-builder-title" className="mt-2 text-2xl font-bold tracking-[-0.02em]">
              Build your season
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Pick a strategy — the itinerary updates instantly and never double-books a day. Genre
              matches the festival&apos;s own tag or the genres of artists in its lineup.
            </p>
          </div>
          <div className="rounded-full border border-border bg-muted/50 px-4 py-2">
            <span className="tabular text-xl font-semibold tracking-tight">{itinerary.length}</span>
            <span className="ml-1.5 text-xs text-muted-foreground">
              festival{itinerary.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <fieldset className="mt-8">
          <legend className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Strategy
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {STRATEGIES.map((option) => {
              const selected = strategy === option.value;
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`group relative flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition-all duration-300 ease-out-expo sm:p-5 ${
                    selected
                      ? 'border-primary/50 bg-primary/[0.04] shadow-[0_16px_32px_-20px_rgba(163,23,46,0.45)]'
                      : 'border-border bg-background/60 hover:border-primary/25 hover:bg-muted/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="strategy"
                    value={option.value}
                    checked={selected}
                    onChange={() => setStrategy(option.value)}
                    className="sr-only"
                  />
                  <span className="flex items-center justify-between">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300 ease-out-expo ${
                        selected
                          ? 'border-primary/25 bg-primary/10 text-primary'
                          : 'border-border bg-muted/70 text-muted-foreground group-hover:text-foreground'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.5} />
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 ease-out-expo ${
                        selected
                          ? 'scale-100 bg-primary text-primary-foreground opacity-100'
                          : 'scale-50 border border-border opacity-0'
                      }`}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  </span>
                  <span className="text-sm font-semibold tracking-tight">{option.label}</span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {option.description}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Filters
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label>
              <FilterLabel>Region</FilterLabel>
              <Select
                value={region}
                onChange={(e) => setRegion(e.target.value as 'all' | 'north' | 'south')}
              >
                {Object.entries(REGION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </label>

            <label>
              <FilterLabel>Genre</FilterLabel>
              <Input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. EDM, jazz"
              />
            </label>

            <label htmlFor="plan-camping">
              <FilterLabel>Camping</FilterLabel>
              <Select
                id="plan-camping"
                value={camping}
                onChange={(e) => setCamping(e.target.value as 'any' | 'yes' | 'no')}
              >
                <option value="any">Any</option>
                <option value="yes">Camping available</option>
                <option value="no">No camping</option>
              </Select>
            </label>

            <label>
              <FilterLabel>Min days</FilterLabel>
              <Input
                type="number"
                min={1}
                value={minDays}
                onChange={(e) => setMinDays(e.target.value)}
                placeholder="Any"
              />
            </label>

            <label>
              <FilterLabel>Max festivals</FilterLabel>
              <Input
                type="number"
                min={1}
                value={maxCount}
                onChange={(e) => setMaxCount(e.target.value)}
                placeholder="Any"
              />
            </label>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="tabular font-semibold text-foreground">{itinerary.length}</span>{' '}
              festival{itinerary.length !== 1 ? 's' : ''}
              {firstDate && lastDate ? (
                <span className="tabular"> · {formatDateRange(firstDate, lastDate)}</span>
              ) : null}
            </p>
            {itinerary.length > 0 && (
              <button
                type="button"
                onClick={addAllToPlan}
                className="group inline-flex h-10 items-center gap-2 rounded-full bg-primary pl-4 pr-1.5 text-xs font-semibold text-primary-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_8px_20px_-12px_rgba(163,23,46,0.5)] transition-all duration-300 ease-out-expo hover:bg-primary/90 active:scale-[0.98]"
              >
                Add all to my plan
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5">
                  <Plus size={14} strokeWidth={2.5} />
                </span>
              </button>
            )}
          </div>

          {itinerary.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-10 text-center text-sm text-muted-foreground">
              No festivals match those choices — try widening the region, genre, or camping filter.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-1.5">
              {itinerary.map((festival) => {
                const days = festivalDurationDays(festival);
                return (
                  <li
                    key={festival.slug}
                    className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors duration-300 ease-out-expo hover:bg-muted/60 sm:px-4"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/festivals/${festival.slug}`}
                        className="block truncate text-sm font-semibold tracking-tight hover:underline"
                      >
                        {festival.name}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {[
                          formatDateRange(festival.startDate, festival.endDate) ??
                            festival.dateText,
                          festival.region ? formatRegion(festival.region) : null,
                          festival.genre,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {days >= 2 && (
                          <span className="tabular rounded-full bg-muted px-2 py-px text-[10px] font-semibold text-muted-foreground">
                            {days} days
                          </span>
                        )}
                        {festival.camping && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-px text-[10px] font-semibold text-muted-foreground">
                            <Tent size={10} strokeWidth={1.75} />
                            Camping
                          </span>
                        )}
                        {festival.attendance && (
                          <span className="tabular text-[10px] text-muted-foreground/80">
                            ~{festival.attendance.toLocaleString('en-NZ')}
                          </span>
                        )}
                        {festival.ticketPrice && (
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {festival.ticketPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    <FestivalStatusBadge status={festival.status} />
                    <PlanStatusSelect slug={festival.slug} name={festival.name} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </Reveal>
  );
}
