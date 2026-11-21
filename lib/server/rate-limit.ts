import "server-only";
import { ServiceError } from "./errors";

type Bucket = { hits: number[] };

const globalForLimits = globalThis as typeof globalThis & { relayRateLimits?: Map<string, Bucket> };
const buckets = globalForLimits.relayRateLimits ?? new Map<string, Bucket>();
globalForLimits.relayRateLimits = buckets;

function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if ((bucket.hits.at(-1) ?? 0) < now - 60 * 60 * 1000) buckets.delete(key);
  }
}

export function consume(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  sweep(now);
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((time) => time > now - windowMs);
  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  return true;
}

export const limits = {
  send: { limit: 20, windowMs: 10_000, message: "You are sending messages too quickly. Wait a few seconds." },
  upload: { limit: 20, windowMs: 60_000, message: "Too many uploads. Wait a minute and try again." },
  typing: { limit: 1, windowMs: 3_000, message: "" },
  action: { limit: 60, windowMs: 60_000, message: "Too many requests. Slow down a little." },
} as const;

export function assertWithinLimit(kind: keyof typeof limits, userId: string) {
  const rule = limits[kind];
  if (!consume(`${kind}:${userId}`, rule.limit, rule.windowMs)) {
    throw new ServiceError("RATE_LIMITED", rule.message);
  }
}
