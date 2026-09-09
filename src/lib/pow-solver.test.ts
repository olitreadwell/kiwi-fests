import { describe, expect, it } from 'vitest';
import { createPowChallenge, verifyPowSolution } from '@/lib/pow';
import { solvePowChallenge } from '@/lib/pow-solver';

describe('solvePowChallenge', () => {
  it('produces a nonce the server accepts', async () => {
    const challenge = createPowChallenge(2);
    const nonce = await solvePowChallenge(challenge);
    expect(verifyPowSolution({ challengeId: challenge.challengeId, nonce })).toBe(true);
  });
});
