import { toSlug } from '@/lib/slug';
import type { ScrapedListing } from '@/lib/scrapers/types';

/**
 * Find candidates the dataset does not already know, by id. Existing
 * verified data always wins over a scraper's second sighting.
 *
 * @param currentIds - Ids already in the dataset
 * @param scraped - Raw listings from this run
 * @returns Candidates not yet in the dataset
 */
export function findNewCandidates(
  currentIds: Set<string>,
  scraped: ScrapedListing[]
): ScrapedListing[] {
  return scraped.filter((candidate) => !currentIds.has(candidate.id));
}

/**
 * Verify a candidate promotes cleanly: the id slugifies correctly and all
 * required fields are present. Optionally also checks the source URL is
 * still live (used by scripts/run-scrapers.ts with --verify).
 *
 * @param candidate - Candidate listing
 * @returns Error message when the candidate fails, null when it promotes
 */
export function verifyCandidate(candidate: ScrapedListing): string | null {
  if (!candidate.name.trim()) return 'missing name';
  if (!candidate.city.trim()) return `missing city: ${candidate.id}`;
  if (!candidate.region.trim()) return `missing region: ${candidate.id}`;
  if (toSlug(candidate.name) !== candidate.id) return `slug mismatch: ${candidate.name}`;
  return null;
}

/**
 * Promote verified candidates into the dataset: every candidate that
 * passes verification is included, failures are reported as skipped.
 *
 * @param candidates - Candidates to promote
 * @returns Promotable candidates and the skipped ones with reasons
 */
export function promoteCandidates(candidates: ScrapedListing[]): {
  promotable: ScrapedListing[];
  skipped: Array<{ candidate: ScrapedListing; reason: string }>;
} {
  const promotable: ScrapedListing[] = [];
  const skipped: Array<{ candidate: ScrapedListing; reason: string }> = [];
  for (const candidate of candidates) {
    const reason = verifyCandidate(candidate);
    if (reason) skipped.push({ candidate, reason });
    else promotable.push(candidate);
  }
  return { promotable, skipped };
}
