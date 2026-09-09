import robotsParser from 'robots-parser';
import { getSiteConfig } from '@/lib/site-config';

/** User agent sent with every scraper request, including a contact surface. */
export const SCRAPER_UA = `Mozilla/5.0 (compatible; ${getSiteConfig().name.replace(/\s+/g, '')}Bot/1.0; +${getSiteConfig().contactEmail || 'https://example.com'})`;

/** Cache of parsed robots.txt files per origin, so a multi-source run checks each origin once. */
const robotsCache = new Map<string, ReturnType<typeof robotsParser>>();

/** Minimum milliseconds between requests to the same origin. */
export const SCRAPER_MIN_DELAY_MS = 500;

/** Per-origin last-request timestamp, enforcing a polite crawl pace. */
const lastRequestByOrigin = new Map<string, number>();

/**
 * Check robots.txt for a URL, allowing the fetch when the origin has no
 * robots.txt or says nothing about our user agent.
 *
 * @param url - URL to check
 * @returns True when fetching is permitted
 */
export async function checkRobots(url: string): Promise<boolean> {
  const origin = new URL(url).origin;
  const cached = robotsCache.get(origin);
  if (cached) return cached.isAllowed(url, SCRAPER_UA) ?? true;
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { 'user-agent': SCRAPER_UA },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      robotsCache.set(origin, robotsParser(`${origin}/robots.txt`, ''));
      return true;
    }
    const body = await res.text();
    const robots = robotsParser(`${origin}/robots.txt`, body);
    robotsCache.set(origin, robots);
    return robots.isAllowed(url, SCRAPER_UA) ?? true;
  } catch {
    return true;
  }
}

/**
 * Wait the minimum polite delay since the last request to the origin.
 *
 * @param url - URL about to be fetched
 */
export async function respectRateLimit(url: string): Promise<void> {
  const origin = new URL(url).origin;
  const last = lastRequestByOrigin.get(origin) ?? 0;
  const wait = Math.max(0, SCRAPER_MIN_DELAY_MS - (Date.now() - last));
  if (wait > 0) await sleep(wait);
  lastRequestByOrigin.set(origin, Date.now());
}

/**
 * Fetch an HTML page politely: robots.txt check, rate limit, one follow-up
 * retry with exponential backoff plus jitter.
 *
 * @param url - Page URL
 * @returns The HTML body as text
 */
export async function fetchHtml(url: string): Promise<string> {
  if (!(await checkRobots(url))) {
    throw new Error(`Blocked by robots.txt: ${url}`);
  }
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await respectRateLimit(url);
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': SCRAPER_UA, accept: 'text/html,application/xhtml+xml' },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      return await res.text();
    } catch (err) {
      if (attempt === 0) {
        // Exponential backoff with jitter: 1s base, 500ms jitter, then retry once.
        await sleep(1000 + Math.floor(Math.random() * 500));
        continue;
      }
      throw err instanceof Error ? err : new Error(String(err));
    }
  }
  throw new Error(`fetch failed: ${url}`);
}

/**
 * Sleep helper, injectable into scraper loops between pages.
 *
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
