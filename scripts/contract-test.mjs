// Contract test: verifies a running server matches the OpenAPI spec and the
// dataset endpoints behave as documented (ETag round-trips, 404s, CSV).
// Usage: BASE_URL=http://localhost:3521 node scripts/contract-test.mjs

const base = process.env.BASE_URL ?? 'http://localhost:3001';

let failures = 0;

function check(condition, label) {
  if (condition) {
    console.log(`ok   ${label}`);
    return;
  }
  failures += 1;
  console.log(`FAIL ${label}`);
}

async function main() {
  const specRes = await fetch(`${base}/api/openapi.json`);
  if (!specRes.ok) throw new Error(`openapi.json HTTP ${specRes.status}`);
  const spec = await specRes.json();
  const paths = Object.keys(spec.paths ?? {});
  console.log(`Spec: ${spec.info.title} v${spec.info.version}, ${paths.length} paths`);
  check(spec.openapi === '3.1.0', 'spec openapi 3.1.0');
  check(paths.includes('/api/v1/items'), 'spec declares /api/v1/items');
  check(paths.includes('/api/v1/items/[id]'), 'spec declares /api/v1/items/{id}');

  const itemsRes = await fetch(`${base}/api/v1/items?limit=200`);
  const items = await itemsRes.json();
  check(Array.isArray(items.data), '/api/v1/items returns { data: [...] }');
  check(typeof items.meta?.total === 'number', '/api/v1/items returns meta.total');
  check(
    items.data.every((item) => typeof item.id === 'string' && typeof item.name === 'string'),
    'every item has id + name'
  );

  // Resolve detail checks against a real seed item so the test adapts to
  // whichever dataset the repo ships.
  const firstItemId = items.data[0]?.id;
  check(typeof firstItemId === 'string', 'items expose an id for detail checks');

  for (const path of paths) {
    const methods = Object.keys(spec.paths[path]);
    for (const method of methods) {
      if (method !== 'get') continue;
      const operation = spec.paths[path][method];
      let resolvedPath = path.replace(/\[id\]/g, firstItemId ?? '');
      for (const param of operation.parameters ?? []) {
        if (param.in === 'path') {
          resolvedPath = resolvedPath.replace(`{${param.name}}`, firstItemId ?? '');
        }
      }
      const url = new URL(`${base}${resolvedPath}`);
      for (const param of operation.parameters ?? []) {
        if (param.in === 'query' && param.required) url.searchParams.set(param.name, 'test');
      }
      const res = await fetch(url);
      check(res.status === 200, `GET ${path} → ${res.status}`);
    }
  }

  const detailRes = await fetch(`${base}/api/v1/items/${firstItemId}`);
  check(detailRes.status === 200, 'GET /api/v1/items/{id} resolves a seed item');
  const missingRes = await fetch(`${base}/api/v1/items/definitely-not-a-listing`);
  check(missingRes.status === 404, 'GET /api/v1/items/{id} 404 for unknown');

  const citiesRes = await fetch(`${base}/api/v1/cities`);
  const cities = await citiesRes.json();
  check(Array.isArray(cities.data) && cities.data.length > 0, '/api/v1/cities returns counts');

  const categoriesRes = await fetch(`${base}/api/v1/categories`);
  const categories = await categoriesRes.json();
  check(
    Array.isArray(categories.data) && categories.data.length > 0,
    '/api/v1/categories returns counts'
  );

  const datasetRes = await fetch(`${base}/api/v1/dataset`);
  const dataset = await datasetRes.json();
  check(dataset.items?.length === items.data.length, 'dataset.items == /items count');

  const csvRes = await fetch(`${base}/api/v1/dataset.csv`);
  const csv = await csvRes.text();
  const csvLines = csv.trim().split('\n');
  check(csvLines[0].toLowerCase().includes('name'), 'CSV has header row');
  check(csvLines.length - 1 === items.data.length, 'CSV rows == item count');
  check((csvRes.headers.get('content-type') ?? '').includes('text/csv'), 'CSV content-type');

  const searchRes = await fetch(`${base}/api/search?q=rhythm`);
  check(searchRes.status === 200, 'GET /api/search works');

  const metaRes = await fetch(`${base}/api/v1/dataset/meta`);
  const meta = await metaRes.json();
  check(metaRes.status === 200 && typeof meta.version === 'string', 'dataset/meta returns version');
  check(meta.itemCount === items.data.length, 'dataset/meta itemCount == /items count');

  const etag = datasetRes.headers.get('etag');
  check(etag !== null, 'dataset response has ETag');
  const cachedRes = await fetch(`${base}/api/v1/dataset`, {
    headers: { 'if-none-match': etag ?? '' },
  });
  check(etag !== null && cachedRes.status === 304, 'dataset ETag round-trip returns 304');
  const csvEtag = csvRes.headers.get('etag');
  check(csvEtag !== null && csvEtag === etag, 'CSV ETag matches JSON dataset ETag');

  const feedRes = await fetch(`${base}/feed.xml`);
  check(feedRes.ok, 'feed.xml serves');
  const icsRes = await fetch(`${base}/calendar.ics`);
  check(icsRes.ok, 'calendar.ics serves');
  const sitemapRes = await fetch(`${base}/sitemap.xml`);
  check(sitemapRes.ok, 'sitemap.xml serves');

  const cronRes = await fetch(`${base}/api/cron/refresh`);
  check(cronRes.status === 200, 'cron refresh answers (skipped in snapshot mode)');

  if (failures > 0) {
    console.error(`Contract test failed: ${failures} check(s).`);
    process.exit(1);
  }
  console.log('Contract test passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
