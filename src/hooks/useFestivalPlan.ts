'use client';

import { useCallback, useState } from 'react';
import {
  readFestivalPlan,
  setPlanStatus,
  writeFestivalPlan,
  type FestivalPlan,
  type PlanStatus,
} from '@/lib/plan-storage';

export function useFestivalPlan() {
  const [plan, setPlan] = useState<FestivalPlan>(() => readFestivalPlan());

  const setStatus = useCallback((slug: string, status: PlanStatus | null) => {
    setPlan((prev) => {
      const next = setPlanStatus(prev, slug, status);
      writeFestivalPlan(next);
      return next;
    });
  }, []);

  const statusOf = useCallback((slug: string) => plan[slug] ?? null, [plan]);

  return {
    plan,
    statusOf,
    setStatus,
    savedCount: Object.keys(plan).length,
  };
}
