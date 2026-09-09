import { buildExportFromSource } from '@/lib/db';
import { toErrorResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * Escape one CSV cell, quoting and doubling quotes when needed.
 *
 * @param value - Cell value
 * @returns CSV-safe cell text
 */
function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * GET /api/v1/dataset.csv — the dataset export as CSV, sharing the JSON
 * dataset's content-hash ETag so the two representations stay in sync.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const dataset = await buildExportFromSource();
    const etag = `"${dataset.version}"`;
    if (request.headers.get('if-none-match') === etag) {
      return new Response(null, {
        status: 304,
        headers: { etag, 'cache-control': 'public, max-age=3600' },
      });
    }
    const header = [
      'id',
      'name',
      'city',
      'region',
      'location',
      'categories',
      'description',
      'website',
      'source',
      'lastVerified',
      'verified',
    ];
    const rows = dataset.items.map((item) =>
      [
        item.id,
        item.name,
        item.city,
        item.region,
        item.location ?? '',
        item.categories.join('; '),
        item.description ?? '',
        item.website ?? '',
        item.source.url,
        item.lastVerified,
        item.verified,
      ]
        .map(csvCell)
        .join(',')
    );
    return new Response([header.join(','), ...rows].join('\n'), {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="dataset.csv"',
        etag,
        'cache-control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
