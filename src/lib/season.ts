// NZ festival seasons. Summer spans the calendar-year boundary (Dec–Feb),
// so it is labelled "Summer 25/26" rather than by a single year.

export type SeasonKey = 'SUMMER' | 'AUTUMN' | 'WINTER' | 'SPRING';

export interface Season {
  key: SeasonKey;
  label: string;
  start: Date;
  end: Date;
}

const SEASON_START_MONTH: Record<SeasonKey, number> = {
  SUMMER: 11, // December
  AUTUMN: 2, // March
  WINTER: 5, // June
  SPRING: 8, // September
};

const SEASON_ORDER: SeasonKey[] = ['SUMMER', 'AUTUMN', 'WINTER', 'SPRING'];

function seasonStart(key: SeasonKey, year: number): Date {
  return new Date(Date.UTC(year, SEASON_START_MONTH[key], 1));
}

function seasonEnd(key: SeasonKey, year: number): Date {
  const nextIndex = (SEASON_ORDER.indexOf(key) + 1) % SEASON_ORDER.length;
  const nextKey = SEASON_ORDER[nextIndex];
  const nextYear = key === 'SUMMER' ? year + 1 : year;
  return seasonStart(nextKey, nextYear);
}

function seasonLabel(key: SeasonKey, year: number): string {
  if (key === 'SUMMER') {
    const short = (y: number) => String(y % 100).padStart(2, '0');
    return `Summer ${short(year)}/${short(year + 1)}`;
  }
  return `${key.charAt(0) + key.slice(1).toLowerCase()} ${year}`;
}

/** The NZ festival season a date falls in. */
export function getSeasonForDate(date: Date): Season {
  const year = date.getUTCFullYear();
  // Jan/Feb belong to the Summer that started the previous December.
  const summerStart = seasonStart('SUMMER', year - 1);
  const summerEnd = seasonEnd('SUMMER', year - 1);
  if (date >= summerStart && date < summerEnd) {
    return {
      key: 'SUMMER',
      label: seasonLabel('SUMMER', year - 1),
      start: summerStart,
      end: summerEnd,
    };
  }
  for (const key of SEASON_ORDER) {
    const start = seasonStart(key, year);
    const end = seasonEnd(key, year);
    if (date >= start && date < end) {
      return { key, label: seasonLabel(key, year), start, end };
    }
  }
  // December belongs to the Summer season that starts in this calendar year.
  const start = seasonStart('SUMMER', year);
  return {
    key: 'SUMMER',
    label: seasonLabel('SUMMER', year),
    start,
    end: seasonEnd('SUMMER', year),
  };
}

export interface SeasonGroup<T> {
  season: Season;
  festivals: T[];
}

/** Group festivals into their NZ seasons, in calendar order. */
export function groupFestivalsBySeason<T extends { startDate: Date | null }>(
  festivals: T[]
): SeasonGroup<T>[] {
  const groups = new Map<string, SeasonGroup<T>>();
  for (const festival of festivals) {
    if (!festival.startDate) continue;
    const season = getSeasonForDate(festival.startDate);
    const existing = groups.get(season.label);
    if (existing) {
      existing.festivals.push(festival);
    } else {
      groups.set(season.label, { season, festivals: [festival] });
    }
  }
  return [...groups.values()]
    .sort((a, b) => a.season.start.getTime() - b.season.start.getTime())
    .map((group) => ({
      ...group,
      festivals: [...group.festivals].sort(
        (a, b) => (a.startDate?.getTime() ?? 0) - (b.startDate?.getTime() ?? 0)
      ),
    }));
}
