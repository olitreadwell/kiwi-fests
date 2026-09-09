import type { Metadata } from 'next';
import { listAllFestivals } from '@/lib/festival-data';
import { FestivalStatus } from '@/lib/festival-types';
import type { PlanFestival } from '@/lib/plan-optimizer';
import PlanPageClient from './_components/PlanPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Plan your festival season — Aotearoa Festivals',
  description:
    'Browse upcoming New Zealand festivals grouped by season, mark them interested or planned, and build a non-overlapping season itinerary.',
};

export type PlanFestivalWithStatus = PlanFestival & {
  dateText: string | null;
  status: FestivalStatus;
};

export default async function PlanPage() {
  const now = new Date();
  const festivals = listAllFestivals().filter(
    (f) => f.startDate === null || f.startDate >= now || f.status === FestivalStatus.ACTIVE
  );

  const planFestivals: PlanFestivalWithStatus[] = festivals
    .sort((a, b) => {
      if (a.startDate && b.startDate) return a.startDate.getTime() - b.startDate.getTime();
      if (a.startDate) return -1;
      if (b.startDate) return 1;
      return a.name.localeCompare(b.name);
    })
    .map((f) => ({
      slug: f.slug,
      name: f.name,
      region: f.region,
      genre: f.genre,
      camping: f.camping,
      ticketPrice: f.ticketPrice,
      attendance: f.attendance,
      lineupGenres: [],
      startDate: f.startDate,
      endDate: f.endDate,
      dateText: f.dateText,
      status: f.status,
    }));

  return <PlanPageClient festivals={planFestivals} />;
}
