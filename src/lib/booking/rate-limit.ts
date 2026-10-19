/**
 * Simple fixed-window rate limit kept in process memory. Good enough for one server and for slowing
 * casual abuse; on Vercel each instance has its own memory, so move this to Vercel KV / Upstash or a
 * DB count once the database exists (docs/booking-architecture.md, phase 1 step 4).
 */
import { createHash } from "node:crypto";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export const RATE_LIMIT = { max: Number(process.env.BOOKING_RATE_LIMIT_MAX ?? 5), windowMs: 60 * 60 * 1000 };

export function rateLimit(key: string, now: number = Date.now(), limit = RATE_LIMIT) {
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + limit.windowMs });
    if (buckets.size > 10_000) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    }
    return { ok: true, retryAfterSeconds: 0 };
  }
  if (b.count >= limit.max) return { ok: false, retryAfterSeconds: Math.ceil((b.resetAt - now) / 1000) };
  b.count++;
  return { ok: true, retryAfterSeconds: 0 };
}

export function resetRateLimitForTests() {
  buckets.clear();
}

export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

/** Store a hash, not the raw IP. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`pot:${ip}`).digest("hex").slice(0, 16);
}
