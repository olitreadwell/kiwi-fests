import { describe, expect, it } from 'vitest';
import { createPowChallenge, verifyPowSolution } from '@/lib/pow';
import type { ChallengeId } from '@/lib/pow';
import { solvePowChallenge } from '@/lib/pow-solver';

describe('proof of work', () => {
  it('verifies a valid solved challenge', async () => {
    const challenge = createPowChallenge(3);
    const nonce = await solvePowChallenge(challenge);
    expect(verifyPowSolution({ challengeId: challenge.challengeId, nonce })).toBe(true);
  });

  it('rejects a wrong nonce', () => {
    const challenge = createPowChallenge(3);
    expect(verifyPowSolution({ challengeId: challenge.challengeId, nonce: '0' })).toBe(false);
  });

  it('consumes challenges after one use', async () => {
    const challenge = createPowChallenge(3);
    const nonce = await solvePowChallenge(challenge);
    expect(verifyPowSolution({ challengeId: challenge.challengeId, nonce })).toBe(true);
    expect(verifyPowSolution({ challengeId: challenge.challengeId, nonce })).toBe(false);
  });

  it('rejects unknown challenges', () => {
    expect(verifyPowSolution({ challengeId: 'nope' as ChallengeId, nonce: '0' })).toBe(false);
  });
});
