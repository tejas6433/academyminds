// lib/rate-limit.ts
// Fixed-window rate limiting for public endpoints (enquiry, auth, checkout).
//
// SCOPE, HONESTLY: this counter lives in the memory of a single serverless
// instance. It reliably stops naive floods — a script hammering one endpoint
// usually lands on the same warm instance — but a distributed attacker hitting
// several instances can exceed the nominal limit. That is a speed bump, not a
// wall, and it is a large improvement over no limit at all.
//
// To make it a wall, swap the Map for Upstash Redis (@upstash/ratelimit) so the
// counter is shared across instances; the `rateLimit()` signature stays the same.

interface Entry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Entry>();

// Bound the map so a spray of unique keys can't grow memory without limit.
const MAX_KEYS = 10_000;

function sweep(now: number) {
  if (buckets.size < MAX_KEYS) return;
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
  // Still oversized after dropping expired entries — reset rather than leak.
  if (buckets.size >= MAX_KEYS) buckets.clear();
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets — send as Retry-After when blocking. */
  retryAfter: number;
}

/**
 * Count one hit against `key`. Returns ok:false once `limit` is exceeded within
 * `windowSeconds`.
 */
export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfter: 0 };
}

/**
 * Best-effort client IP. Vercel sets x-forwarded-for; the left-most entry is the
 * original client. Falls back to a constant so a missing header degrades into a
 * shared bucket rather than skipping the limit entirely.
 */
export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
