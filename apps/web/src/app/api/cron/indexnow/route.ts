import { NextResponse } from 'next/server';

import { getAllPosts, slugifyCategory } from '@/lib/blog';
import { isAuthorizedCron, utcDaysAgo } from '@/lib/cron';
import {
  getIndexNowKey,
  INDEXNOW_ENDPOINT,
  INDEXNOW_HOST,
  INDEXNOW_ORIGIN,
  indexNowKeyLocation,
} from '@/lib/indexnow';

/**
 * Daily IndexNow ping (Vercel Cron, see vercel.json; runs a few hours after
 * /api/cron/publish so newly published posts are already live).
 *
 * Submits posts published or updated in the last 2 days (UTC), plus the pages
 * that list them (/, /blog, the post's category). Every URL is HEAD-checked
 * against production first and only 200s are submitted. Outside the production
 * deployment this is a dry run that returns the would-be urlList.
 */
export const dynamic = 'force-dynamic';

const RECENT_DAYS = 2;
const FETCH_TIMEOUT_MS = 10_000;

async function isLive(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function keyFileMatches(key: string): Promise<boolean> {
  try {
    const res = await fetch(indexNowKeyLocation(key), {
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    return res.ok && (await res.text()).trim() === key;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const since = utcDaysAgo(RECENT_DAYS);
  const recent = getAllPosts().filter(
    (post) =>
      post.date >= since ||
      (post.dateModified !== undefined && post.dateModified >= since)
  );

  if (recent.length === 0) {
    console.info(`[cron/indexnow] No posts published/updated since ${since}.`);
    return NextResponse.json({ submitted: 0, since });
  }

  const paths = new Set<string>(['/', '/blog']);
  for (const post of recent) {
    paths.add(`/${post.slug}`);
    paths.add(`/category/${slugifyCategory(post.category)}`);
  }
  const candidates = Array.from(paths, (p) =>
    p === '/' ? `${INDEXNOW_ORIGIN}/` : `${INDEXNOW_ORIGIN}${p}`
  );

  const checks = await Promise.all(
    candidates.map(async (url) => ({ url, live: await isLive(url) }))
  );
  const urlList = checks.filter((c) => c.live).map((c) => c.url);
  const notLive = checks.filter((c) => !c.live).map((c) => c.url);

  if (notLive.length > 0) {
    console.warn(
      `[cron/indexnow] Skipping non-200 URLs: ${notLive.join(', ')}`
    );
  }
  if (urlList.length === 0) {
    return NextResponse.json({ submitted: 0, since, notLive });
  }

  const key = getIndexNowKey();
  const keyLocation = indexNowKeyLocation(key);
  const payload = { host: INDEXNOW_HOST, key, keyLocation, urlList };

  if (process.env.VERCEL_ENV !== 'production') {
    console.info(
      `[cron/indexnow] Dry run (VERCEL_ENV=${process.env.VERCEL_ENV ?? 'unset'}); would submit ${urlList.length} URL(s).`
    );
    return NextResponse.json({
      dryRun: true,
      submitted: 0,
      since,
      host: INDEXNOW_HOST,
      keyLocation,
      urlList,
      notLive,
    });
  }

  if (!(await keyFileMatches(key))) {
    console.error(
      `[cron/indexnow] Key file ${keyLocation} is missing or doesn't match the key; not submitting.`
    );
    return NextResponse.json(
      { submitted: 0, error: 'key file mismatch', keyLocation },
      { status: 500 }
    );
  }

  let status: number;
  let body = '';
  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    status = res.status;
    body = await res.text().catch(() => '');
  } catch (err) {
    console.error('[cron/indexnow] Request to IndexNow failed:', err);
    return NextResponse.json(
      { submitted: 0, error: 'request failed' },
      { status: 502 }
    );
  }

  if (status === 200 || status === 202) {
    console.info(
      `[cron/indexnow] Submitted ${urlList.length} URL(s) (HTTP ${status}): ${urlList.join(', ')}`
    );
    return NextResponse.json({ submitted: urlList.length, status, urlList });
  }

  if (status === 403) {
    console.error(
      `[cron/indexnow] 403: key not valid (key file ${keyLocation} not found or mismatched). ${body.slice(0, 300)}`
    );
  } else if (status === 422) {
    console.error(
      `[cron/indexnow] 422: URLs don't belong to ${INDEXNOW_HOST} or key/keyLocation mismatch. ${body.slice(0, 300)}`
    );
  } else {
    console.error(
      `[cron/indexnow] Unexpected HTTP ${status}. ${body.slice(0, 300)}`
    );
  }
  return NextResponse.json({ submitted: 0, status, urlList }, { status: 502 });
}
