/**
 * Fixed-window per-key rate limiter.
 * In-memory, single instance; multi-instance deploys should rate limit at a
 * proxy (see docs/contact.md).
 */
export class FixedWindowRateLimiter {
  private hits = new Map<string, { count: number; windowStart: number }>();

  /**
   * @param max - Max requests allowed per window
   * @param windowMs - Window length in milliseconds
   */
  constructor(
    private readonly max: number,
    private readonly windowMs: number
  ) {}

  /**
   * Check whether a key may proceed.
   *
   * @param key - Per-caller key, usually an IP address
   * @returns True when under the limit, false when blocked
   */
  allow(key: string): boolean {
    const now = Date.now();
    const current = this.hits.get(key);
    if (!current || now - current.windowStart >= this.windowMs) {
      this.hits.set(key, { count: 1, windowStart: now });
      return true;
    }
    if (current.count >= this.max) return false;
    current.count += 1;
    return true;
  }
}

/**
 * Best-effort client IP from standard proxy headers.
 *
 * @param request - Incoming request
 * @returns Client IP string, or "unknown"
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
