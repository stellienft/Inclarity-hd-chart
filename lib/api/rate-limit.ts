/**
 * A small in-process rate limiter for the public endpoints.
 *
 * Deliberately simple: a fixed window keyed by client IP, held in memory. This
 * is enough to stop casual abuse of a single instance. It is NOT a distributed
 * limiter — behind multiple instances each holds its own counters, so a real
 * deployment should put a shared limiter (or the platform's own) in front.
 * That trade-off is recorded here rather than left implicit.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/** Bound the map so a flood of unique keys cannot grow memory without limit. */
const MAX_TRACKED_KEYS = 10_000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) {
      for (const [candidate, window] of windows) {
        if (window.resetAt <= now) windows.delete(candidate);
      }
      if (windows.size >= MAX_TRACKED_KEYS) windows.clear();
    }
    const fresh: Window = { count: 1, resetAt: now + windowMs };
    windows.set(key, fresh);
    return { allowed: true, remaining: limit - 1, resetAt: fresh.resetAt };
  }

  existing.count += 1;
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

/**
 * Best-effort client identity.
 *
 * Proxy headers are attacker-controllable, so this is a throttling signal, not
 * an authentication one.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Exposed for tests. */
export function resetRateLimits(): void {
  windows.clear();
}
