import { buildExportFromSource } from '@/lib/db';
import { getSiteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

/**
 * Escape one iCal text value: backslash, semicolon and comma per RFC 5545.
 *
 * @param text - Raw text
 * @returns Escaped text
 */
function escapeIcs(text: string): string {
  return text.replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n');
}

/**
 * Format a YYYY-MM-DD date as an all-day iCal DATE value.
 *
 * @param date - ISO date
 * @returns DATE value, e.g. 20260905
 */
function toIcsDate(date: string): string {
  return date.replace(/-/g, '');
}

/**
 * GET /calendar.ics — all-day VEVENTs for every listing with calendar
 * dates, for calendar apps and add-to-calendar links.
 */
export async function GET(): Promise<Response> {
  const config = getSiteConfig();
  const dataset = await buildExportFromSource();
  const events = dataset.items.flatMap((item) =>
    item.calendarDates.map((d) =>
      [
        'BEGIN:VEVENT',
        `UID:${item.id}@${config.name.toLowerCase().replace(/\s+/g, '-')}`,
        `DTSTART;VALUE=DATE:${toIcsDate(d.start)}`,
        ...(d.end ? [`DTEND;VALUE=DATE:${toIcsDate(d.end)}`] : []),
        `SUMMARY:${escapeIcs(d.label ? `${item.name} — ${d.label}` : item.name)}`,
        ...(item.location ? [`LOCATION:${escapeIcs(`${item.location}, ${item.city}`)}`] : []),
        ...(item.website ? [`URL:${item.website}`] : []),
        'END:VEVENT',
      ].join('\r\n')
    )
  );
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OpenItemsDirectory//calendar.ics//EN',
    `X-WR-CALNAME:${config.name} — dates`,
    'REFRESH-INTERVAL;VALUE=DURATION:P1D',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
  return new Response(ics, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': 'inline; filename="calendar.ics"',
    },
  });
}
