import { createHash, randomBytes } from 'node:crypto';
import type { Tagged } from 'type-fest';

/**
 * Branded challenge ID. Distinct from nonces and other hex strings, so a
 * challenge ID can never be passed where a nonce is expected (and vice
 * versa) inside the typed domain.
 */
export type ChallengeId = Tagged<string, 'ChallengeId'>;

/** A challenge the client must solve before submitting feedback or contact. */
export interface PowChallenge {
  challengeId: ChallengeId;
  noncePrefix: string;
  difficulty: number;
  expiresAt: number;
}

/** Client-supplied solution to a PoW challenge. */
export interface PowSolution {
  challengeId: ChallengeId;
  nonce: string;
}

const DEFAULT_DIFFICULTY = 4;
const DEFAULT_TTL_MS = 5 * 60 * 1000;

// In-memory challenge store. Single-instance deploy only; multi-instance
// setups should move this to a shared store or a proxy (see docs/contact.md).
const challenges = new Map<string, PowChallenge>();

/**
 * Create and remember a proof-of-work challenge.
 * Difficulty is the number of leading zero hex digits required in the hash.
 *
 * @param difficulty - Leading hex zeros required (default 4, ~65k hashes)
 * @param ttlMs - Challenge lifetime in ms
 * @returns The challenge to hand to the client
 */
export function createPowChallenge(
  difficulty = DEFAULT_DIFFICULTY,
  ttlMs = DEFAULT_TTL_MS
): PowChallenge {
  const challengeId = randomBytes(16).toString('hex') as ChallengeId;
  const challenge: PowChallenge = {
    challengeId,
    noncePrefix: randomBytes(16).toString('hex'),
    difficulty,
    expiresAt: Date.now() + ttlMs,
  };
  challenges.set(challengeId, challenge);
  return challenge;
}

/**
 * Verify a solution against a stored challenge. Consumes the challenge.
 *
 * @param solution - Client-supplied challenge id + nonce
 * @returns True when the hash has enough leading zeros and is not expired
 */
export function verifyPowSolution(solution: PowSolution): boolean {
  const challenge = challenges.get(solution.challengeId);
  if (!challenge) return false;
  challenges.delete(solution.challengeId);
  if (Date.now() > challenge.expiresAt) return false;
  const hash = createHash('sha256')
    .update(challenge.noncePrefix + solution.nonce)
    .digest('hex');
  return hash.startsWith('0'.repeat(challenge.difficulty));
}
