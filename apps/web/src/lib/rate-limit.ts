import { NextRequest } from 'next/server';

import RateLimitCounter from './models/rate-limit-counter';

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Clean expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of store) {
        if (entry.resetAt < now) {
          store.delete(key);
        }
      }
    },
    5 * 60 * 1000
  );
}

/**
 * Check rate limit. Returns { allowed, remaining, resetAt }.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count++;
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  };
}

/**
 * Fixed-window rate limit backed by MongoDB, so the count holds across
 * serverless instances (the in-memory limiter above is per instance).
 * Caller must have run connectDB().
 */
export async function checkSharedRateLimit(
  key: string,
  limit: number,
  windowMs = 60_000
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const resetAt = windowStart + windowMs;
  const id = `${key}:${windowStart}`;

  const increment = () =>
    RateLimitCounter.findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(resetAt) } },
      { upsert: true, returnDocument: 'after' }
    ).lean();

  let counter;
  try {
    counter = await increment();
  } catch (err) {
    // Two concurrent upserts on a fresh window: one loses with E11000. Retry
    // once; the document now exists so the second attempt is a plain update.
    if ((err as { code?: number }).code !== 11000) {
      throw err;
    }
    counter = await increment();
  }

  const count = counter?.count ?? 1;
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

/** Extract client IP from request headers. */
export function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}
