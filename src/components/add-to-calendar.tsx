import type { Item } from '@/data/schema';

/**
 * Per-item add-to-calendar links. Files live in /public/calendars/{id}.ics
 * (built by scripts/build-snapshot.mjs alongside the snapshot) plus a
 * subscribe link to the full feed.
 */
export function AddToCalendar({ item }: { item: Item }): React.ReactElement | null {
  if (item.calendarDates.length === 0) return null;
  return (
    <p className="text-sm">
      <a
        className="text-blue-600 underline dark:text-blue-400"
        href={`/calendars/${item.id}.ics`}
        download={`${item.id}.ics`}
      >
        Add dates to your calendar
      </a>
      {' · '}
      <a className="text-blue-600 underline dark:text-blue-400" href="/calendar.ics">
        subscribe to all dates
      </a>
    </p>
  );
}
