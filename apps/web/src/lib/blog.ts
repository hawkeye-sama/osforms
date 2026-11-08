import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/blog');

export type BlogCategory =
  | 'Build'
  | 'Integrate'
  | 'Ship'
  | 'Compare'
  | 'BYOK Files';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** Optional search-optimized title used for the <title>/OG tag (falls back to title). */
  seoTitle?: string;
  /** Primary keyphrase the post targets; surfaced as the lead keyword. */
  focusKeyphrase?: string;
  date: string;
  dateModified?: string;
  author: string;
  tags: string[];
  readingTime: string;
  category: BlogCategory;
  coverImage?: string;
  faq?: Array<{ question: string; answer: string }>;
  content: string;
}

export type BlogPostMeta = Omit<BlogPost, 'content'>;

/* ── Scheduled publishing ─────────────────────────────────────────────────
 * A post whose `date` is in the future is "scheduled": it stays out of every
 * public surface (pages, sitemap, RSS, llms.txt, categories, related posts…)
 * until a build runs on or after that date. The daily /api/cron/publish job
 * triggers that build. See src/app/api/cron/publish/route.ts.
 */

/** Today's date in UTC as 'YYYY-MM-DD'. */
export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Cutoff for "published": the date the running build was made (BUILD_DATE,
 * inlined by next.config.ts), falling back to today. Using the build date keeps
 * runtime routes (e.g. /api/md-render) consistent with the statically built
 * pages: a post that became due after the last build stays hidden everywhere
 * until the next build, instead of having a .md twin but a 404 HTML page.
 */
function publishCutoff(): string {
  const today = todayUtc();
  const built = process.env.BUILD_DATE;
  return built && built < today ? built : today;
}

/** True once a post's date (YYYY-MM-DD) is on or before the publish cutoff. */
export function isPublished(post: Pick<BlogPostMeta, 'date'>): boolean {
  return post.date <= publishCutoff();
}

/**
 * Normalize a frontmatter date to 'YYYY-MM-DD'. Unquoted YAML dates
 * (`date: 2026-11-08`) parse to Date objects; quoted ones stay strings.
 */
function toDateString(value: unknown): string | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? undefined
      : value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime())
      ? undefined
      : parsed.toISOString().slice(0, 10);
  }
  return undefined;
}

function readFile(slug: string): matter.GrayMatterFile<string> | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return matter(fs.readFileSync(filePath, 'utf-8'));
}

function toMeta(slug: string, data: Record<string, unknown>): BlogPostMeta {
  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    seoTitle: data.seoTitle as string | undefined,
    focusKeyphrase: data.focusKeyphrase as string | undefined,
    // A post without a valid date is treated as never-published (sorts last,
    // never passes isPublished) rather than crashing the build.
    date: toDateString(data.date) ?? '9999-12-31',
    dateModified: toDateString(data.dateModified),
    author: (data.author as string) ?? 'Bahroze Ali',
    tags: (data.tags as string[]) ?? [],
    readingTime: (data.readingTime as string) ?? '5 min read',
    category: (data.category as BlogCategory) ?? 'Build',
    coverImage: data.coverImage as string | undefined,
  };
}

/**
 * Every post on disk, including scheduled (future-dated) ones, newest first.
 * Only for the publish cron; public pages must use getAllPosts().
 */
export function getAllPostsIncludingScheduled(): BlogPostMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .flatMap((file) => {
      const slug = file.replace(/\.mdx$/, '');
      const parsed = readFile(slug);
      return parsed ? [toMeta(slug, parsed.data)] : [];
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Published posts only (date <= cutoff), newest first. */
export function getAllPosts(): BlogPostMeta[] {
  return getAllPostsIncludingScheduled().filter(isPublished);
}

/** A published post by slug; scheduled or missing posts return null. */
export function getPostBySlug(slug: string): BlogPost | null {
  const parsed = readFile(slug);
  if (!parsed) {
    return null;
  }

  const meta = toMeta(slug, parsed.data);
  if (!isPublished(meta)) {
    return null;
  }

  return {
    ...meta,
    faq: parsed.data.faq as
      | Array<{ question: string; answer: string }>
      | undefined,
    content: parsed.content,
  };
}

/**
 * Cover image URL for a post. Uses the post's `coverImage` (generated by the
 * local `npm run covers` script and committed to /public), falling back to the
 * site default OG image if a post hasn't had a cover generated yet.
 */
export function getCoverUrl(
  post: Pick<BlogPost, 'slug' | 'coverImage'>
): string {
  return post.coverImage ?? '/og-image.png';
}

/**
 * Renders a post as a clean, self-contained Markdown document for AI ingestion
 * (served at /{slug}.md and via `Accept: text/markdown`). FAQ lives in
 * frontmatter, so it's appended here to keep the markdown complete.
 */
export function postToMarkdown(post: BlogPost, baseUrl: string): string {
  const faq =
    post.faq && post.faq.length > 0
      ? '\n\n## FAQ\n\n' +
        post.faq.map((f) => `### ${f.question}\n\n${f.answer}`).join('\n\n')
      : '';

  return `# ${post.title}

> ${post.description}

Source: ${baseUrl}/${post.slug}
Published: ${post.date}${post.dateModified ? ` · Updated: ${post.dateModified}` : ''}
Author: ${post.author}

${post.content}${faq}
`;
}

/** URL slug for a category: "BYOK Files" → "byok-files". */
export function slugifyCategory(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface CategoryCopy {
  /** Page title for /category/{slug} (the layout appends "| OSForms"). */
  title: string;
  /** One-line intro shown under the H1 and used as the meta description. */
  intro: string;
}

const CATEGORY_COPY: Record<string, CategoryCopy> = {
  Build: {
    title: 'Form Handling Tutorials',
    intro:
      'Stack tutorials for handling form submissions in plain HTML, React, Next.js, and more, with runnable code and no backend to maintain.',
  },
  Integrate: {
    title: 'Form Integration Guides',
    intro:
      'How to route form submissions to Resend email, Google Sheets, and signed webhooks using your own API keys.',
  },
  Ship: {
    title: 'Building OSForms in Public',
    intro:
      'Notes from building, launching, and running OSForms, the open-source form backend.',
  },
  Compare: {
    title: 'Form Backend Comparisons',
    intro:
      'Side-by-side comparisons of OSForms with other form backends and form builders on pricing, integrations, and data ownership.',
  },
  'BYOK Files': {
    title: 'BYOK and Form Data Ownership',
    intro:
      'Why bring-your-own-key matters for form data: who holds your API keys, where submissions live, and how to avoid lock-in.',
  },
};

export interface CategoryInfo extends CategoryCopy {
  name: string;
  slug: string;
  count: number;
  /** Newest publish/modified date across the category's posts. */
  lastModified: string;
}

function lastModifiedOf(posts: BlogPostMeta[]): string {
  return posts
    .map((p) => p.dateModified ?? p.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
}

/** Every category that has at least one post, derived from frontmatter. */
export function getAllCategories(): CategoryInfo[] {
  const byName = new Map<string, BlogPostMeta[]>();
  for (const post of getAllPosts()) {
    byName.set(post.category, [...(byName.get(post.category) ?? []), post]);
  }

  return Array.from(byName, ([name, posts]) => ({
    name,
    slug: slugifyCategory(name),
    count: posts.length,
    lastModified: lastModifiedOf(posts),
    ...(CATEGORY_COPY[name] ?? {
      title: `${name} Articles`,
      intro: `OSForms articles filed under ${name}.`,
    }),
  }));
}

export function getCategoryBySlug(slug: string): CategoryInfo | null {
  return getAllCategories().find((c) => c.slug === slug) ?? null;
}

export function getPostsByCategory(slug: string): BlogPostMeta[] {
  return getAllPosts().filter((p) => slugifyCategory(p.category) === slug);
}

/**
 * Related posts for the "Continue reading" block: same category first, then
 * the most shared tags, then newest. Excludes the current post.
 */
export function getRelatedPosts(
  post: Pick<BlogPost, 'slug' | 'category' | 'tags'>,
  limit = 3
): BlogPostMeta[] {
  const tags = new Set(post.tags.map((t) => t.toLowerCase()));

  return getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p, newestRank) => ({
      post: p,
      sameCategory: p.category === post.category ? 1 : 0,
      sharedTags: p.tags.filter((t) => tags.has(t.toLowerCase())).length,
      newestRank,
    }))
    .sort(
      (a, b) =>
        b.sameCategory - a.sameCategory ||
        b.sharedTags - a.sharedTags ||
        a.newestRank - b.newestRank
    )
    .slice(0, limit)
    .map(({ post: p }) => p);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
