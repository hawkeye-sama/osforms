import { timingSafeEqual } from 'crypto';

/**
 * Auth for Vercel Cron routes. When CRON_SECRET is set in the project's env,
 * Vercel sends `Authorization: Bearer <CRON_SECRET>` on every cron invocation.
 * With no CRON_SECRET configured, every request is rejected.
 */
export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const header = req.headers.get('authorization') ?? '';
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** 'YYYY-MM-DD' for `days` days before today (UTC). */
export function utcDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}
