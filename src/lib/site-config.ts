/** Site identity shape; every value is plain text the scaffolder rewrites. */
export interface SiteConfig {
  name: string;
  thing: string;
  thingPlural: string;
  city: string;
  region: string;
  baseUrl: string;
  ghRepo: string;
  contactEmail: string;
  staleAfterDays: number;
  refreshSchedule: string;
}

/**
 * Site-wide identity for this open directory.
 *
 * `pnpm run setup` regenerates this file from the scaffolder answers, so
 * every value below is the generic default the template ships with. Keep
 * every key here, not scattered across components: pages, feeds, API
 * metadata and scrapers all read from this one object.
 */
export const siteConfig: SiteConfig = {
  /** Human name of the site, e.g. "Op Shop Directory". */
  name: 'Aotearoa Festivals',
  /** Singular label for one listing, e.g. "op shop". */
  thing: 'festival',
  /** Plural label for listings, e.g. "op shops". */
  thingPlural: 'festivals',
  /** The city the directory starts in, e.g. "Wellington". */
  city: 'New Zealand',
  /** Broader region label, e.g. "Wellington region". */
  region: 'New Zealand',
  /** Public base URL. Defaults to empty in dev; override with NEXT_PUBLIC_SITE_URL. */
  baseUrl: 'https://aotearoa-festivals.vercel.app',
  /** GitHub repo `<owner>/<repo>` used for community issue links. Empty = links hidden. */
  ghRepo: 'olitreadwell/kiwi-fests',
  /** Contact email shown in footers and docs. */
  contactEmail: 'kiwi-fests@ot.mozmail.com',
  /** Days after `lastVerified` before a listing shows as stale. */
  staleAfterDays: 180,
  /** Vercel cron schedule for the daily refresh, in UTC. 2am NZT = 14:00 UTC. */
  refreshSchedule: '0 14 * * *',
};

/**
 * Resolve site identity, applying the `NEXT_PUBLIC_SITE_URL` env override
 * onto the committed defaults so a preview deployment keeps its own URL.
 *
 * @returns The effective site config.
 */
export function getSiteConfig(): SiteConfig {
  return {
    ...siteConfig,
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.baseUrl,
  };
}
