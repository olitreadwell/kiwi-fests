/**
 * Client-safe proof-of-work solver using the Web Crypto API.
 * This module must not import node:crypto — it ships in browser bundles.
 */

/**
 * Brute-force a nonce whose SHA-256 hex digest starts with `difficulty`
 * zeros. Pure Web Crypto, so it runs in browsers, workers, and tests.
 *
 * @param challenge - Challenge returned by the server
 * @returns The winning nonce
 */
export async function solvePowChallenge(challenge: {
  noncePrefix: string;
  difficulty: number;
}): Promise<string> {
  const target = '0'.repeat(challenge.difficulty);
  for (let nonce = 0; nonce < Number.MAX_SAFE_INTEGER; nonce += 1) {
    const digest = await sha256Hex(challenge.noncePrefix + nonce.toString());
    if (digest.startsWith(target)) return nonce.toString();
  }
  throw new Error('pow: no solution found');
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
