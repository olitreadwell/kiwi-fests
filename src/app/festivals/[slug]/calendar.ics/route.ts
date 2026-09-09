import { getFestivalBySlug } from '@/lib/festival-data';
import { formatRegion } from '@/lib/format';

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function isMidnightUtc(date: Date): boolean {
  return date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0;
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function formatDateTimeUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const festival = getFestivalBySlug(slug);

  if (!festival || !festival.startDate) {
    return new Response('Not found', { status: 404 });
  }

  const allDay = isMidnightUtc(festival.startDate);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aotearoa Festivals//calendar.ics//EN',
    'BEGIN:VEVENT',
    `UID:${festival.slug}@aotearoafestivals.co.nz`,
    `DTSTAMP:${formatDateTimeUtc(new Date())}`,
  ];

  if (allDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatDateOnly(festival.startDate)}`);
    if (festival.endDate) {
      lines.push(`DTEND;VALUE=DATE:${formatDateOnly(addDays(festival.endDate, 1))}`);
    }
  } else {
    lines.push(`DTSTART:${formatDateTimeUtc(festival.startDate)}`);
    if (festival.endDate) {
      lines.push(`DTEND:${formatDateTimeUtc(festival.endDate)}`);
    }
  }

  lines.push(`SUMMARY:${escapeIcsText(festival.name)}`);

  const location = festival.location || formatRegion(festival.region);
  if (location) {
    lines.push(`LOCATION:${escapeIcsText(location)}`);
  }

  if (festival.website) {
    lines.push(`URL:${festival.website}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return new Response(lines.join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${festival.slug}.ics"`,
    },
  });
}
