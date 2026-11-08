import { NextResponse } from 'next/server';

import { getAllPostsIncludingScheduled, todayUtc } from '@/lib/blog';
import { isAuthorizedCron } from '@/lib/cron';

/**
 * Daily scheduled-publishing job (Vercel Cron, see vercel.json).
 *
 * Future-dated posts in src/content/blog are the publishing queue: they are
 * hidden until a build runs on/after their date. This job finds posts that are
 * due (BUILD_DATE < date <= today) and, if any, POSTs the Vercel Deploy Hook so
 * a fresh build picks them up.
 *
 * Stateless and self-healing: BUILD_DATE is baked into each build, so if a
 * triggered build fails the live deployment keeps its old BUILD_DATE and the
 * next day's run sees the same posts as due and retries.
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const buildDate = process.env.BUILD_DATE;
  const today = todayUtc();

  if (!buildDate) {
    console.error('[cron/publish] BUILD_DATE is not set; skipping.');
    return NextResponse.json(
      { triggered: false, reason: 'BUILD_DATE missing', today },
      { status: 500 }
    );
  }

  const due = getAllPostsIncludingScheduled().filter(
    (post) => post.date > buildDate && post.date <= today
  );
  const slugs = due.map((post) => post.slug);

  if (slugs.length === 0) {
    console.info(
      `[cron/publish] Nothing due (buildDate=${buildDate}, today=${today}).`
    );
    return NextResponse.json({ triggered: false, buildDate, today, slugs });
  }

  const hookUrl = process.env.DEPLOY_HOOK_URL;
  if (!hookUrl) {
    console.warn(
      `[cron/publish] ${slugs.length} post(s) due but DEPLOY_HOOK_URL is not set: ${slugs.join(', ')}`
    );
    return NextResponse.json({
      triggered: false,
      reason: 'DEPLOY_HOOK_URL not set',
      buildDate,
      today,
      slugs,
    });
  }

  try {
    const res = await fetch(hookUrl, { method: 'POST' });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(
        `[cron/publish] Deploy hook failed: ${res.status} ${body.slice(0, 500)}`
      );
      return NextResponse.json(
        { triggered: false, reason: `deploy hook ${res.status}`, slugs },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error('[cron/publish] Deploy hook request error:', err);
    return NextResponse.json(
      { triggered: false, reason: 'deploy hook request error', slugs },
      { status: 502 }
    );
  }

  console.info(
    `[cron/publish] Triggered rebuild for ${slugs.length} due post(s): ${slugs.join(', ')} (buildDate=${buildDate}, today=${today})`
  );
  return NextResponse.json({ triggered: true, buildDate, today, slugs });
}
