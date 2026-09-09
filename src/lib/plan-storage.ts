// Saved-festival plan, persisted in localStorage so the plan survives
// navigation without an account. Each festival slug maps to a status:
// "interested" (maybe) or "planned" (definitely going).

export type PlanStatus = 'interested' | 'planned';

export type FestivalPlan = Record<string, PlanStatus>;

export const PLAN_STORAGE_KEY = 'aotearoa-festivals:plan';

function isPlanStatus(value: unknown): value is PlanStatus {
  return value === 'interested' || value === 'planned';
}

/** Read the saved plan from localStorage, tolerating legacy formats. */
export function readFestivalPlan(): FestivalPlan {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Legacy format: a plain slug list, all treated as planned.
      const plan: FestivalPlan = {};
      for (const slug of parsed) {
        if (typeof slug === 'string') plan[slug] = 'planned';
      }
      return plan;
    }
    if (parsed && typeof parsed === 'object') {
      const plan: FestivalPlan = {};
      for (const [slug, status] of Object.entries(parsed)) {
        if (isPlanStatus(status)) plan[slug] = status;
      }
      return plan;
    }
    return {};
  } catch {
    return {};
  }
}

/** Persist the plan to localStorage. */
export function writeFestivalPlan(plan: FestivalPlan): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
}

/** Set one festival's plan status, returning a new plan object. */
export function setPlanStatus(
  plan: FestivalPlan,
  slug: string,
  status: PlanStatus | null
): FestivalPlan {
  const next = { ...plan };
  if (status === null) delete next[slug];
  else next[slug] = status;
  return next;
}
