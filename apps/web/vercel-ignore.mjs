#!/usr/bin/env node
/**
 * Vercel "Ignored Build Step" (vercel.json → ignoreCommand).
 * Vercel convention: exit 1 = BUILD, exit 0 = SKIP the build.
 *
 * 1. Scheduled blog posts: if any src/content/blog/*.mdx has a frontmatter
 *    `date` from the last DUE_WINDOW_DAYS days up to today (UTC), BUILD.
 *    The daily /api/cron/publish job fires a Deploy Hook when a future-dated
 *    post becomes due; a deploy hook rebuilds the same commit, so without this
 *    check rule 2 could skip that rebuild (e.g. if the last commit was
 *    docs-only). The window (not just "today") lets the next day's cron retry
 *    after a failed build.
 * 2. Otherwise, the original rule, unchanged:
 *      ! git diff HEAD~1 --name-only | grep -qvE '^apps/docs/'
 *    i.e. BUILD if the last commit touched anything outside apps/docs/,
 *    SKIP if it only touched docs (or if git diff produced no output).
 *
 * Runs before `npm install`, so it uses Node built-ins only.
 * Test locally: `node vercel-ignore.mjs; echo $?`
 */
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DUE_WINDOW_DAYS = 3;
const BLOG_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  'src/content/blog'
);

function utcDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function frontmatterDate(source) {
  const fm = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const line = fm[1].match(/^date:\s*['"]?(\d{4}-\d{2}-\d{2})/m);
  return line ? line[1] : null;
}

function duePosts() {
  const today = utcDaysAgo(0);
  const earliest = utcDaysAgo(DUE_WINDOW_DAYS - 1);
  let files = [];
  try {
    files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));
  } catch {
    return [];
  }
  return files.filter((file) => {
    const date = frontmatterDate(readFileSync(join(BLOG_DIR, file), 'utf8'));
    return date !== null && date >= earliest && date <= today;
  });
}

const due = duePosts();
if (due.length > 0) {
  console.log(
    `[vercel-ignore] Scheduled post(s) due: ${due.join(', ')} -> build`
  );
  process.exit(1);
}

let changed = '';
try {
  changed = execSync('git diff HEAD~1 --name-only', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
} catch {
  changed = '';
}

const outsideDocs = changed
  .split('\n')
  .filter((line) => line !== '' && !/^apps\/docs\//.test(line));

if (outsideDocs.length > 0) {
  console.log(
    `[vercel-ignore] ${outsideDocs.length} non-docs file(s) changed -> build`
  );
  process.exit(1);
}

console.log('[vercel-ignore] Only apps/docs/ changed (or no diff) -> skip');
process.exit(0);
