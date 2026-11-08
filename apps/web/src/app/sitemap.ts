import type { MetadataRoute } from 'next';

import { getAllAuthors } from '@/lib/authors';
import { getAllCategories, getAllPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/site';

/**
 * Hand-maintained lastmod dates for static pages. Bump a date only when that
 * page's content meaningfully changes (find it with `git log -- <file>`), never
 * per deploy: build-time lastmods teach crawlers to ignore the field.
 */
const STATIC_LASTMOD = {
  home: '2026-11-08', // "From the blog" section + metadata
  signup: '2026-11-08', // reCAPTCHA + own metadata
  privacy: '2026-03-26',
  terms: '2026-03-26',
  authors: '2026-11-08', // author page created
} as const;

function newest(first: string, ...rest: Array<string | undefined>): Date {
  const times = [first, ...rest]
    .filter((d): d is string => typeof d === 'string')
    .map((d) => new Date(d).getTime());
  return new Date(Math.max(...times));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latestPost = posts
    .map((p) => p.dateModified ?? p.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/${post.slug}`,
    lastModified: new Date(post.dateModified ?? post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = getAllCategories().map(
    (category) => ({
      url: `${SITE_URL}/category/${category.slug}`,
      lastModified: new Date(category.lastModified),
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  );

  const authorEntries: MetadataRoute.Sitemap = getAllAuthors().map((author) => {
    const authored = posts
      .filter((p) => p.author === author.name)
      .map((p) => p.dateModified ?? p.date);
    return {
      url: `${SITE_URL}/authors/${author.slug}`,
      lastModified: newest(STATIC_LASTMOD.authors, ...authored),
      changeFrequency: 'monthly',
      priority: 0.5,
    };
  });

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      // The homepage lists recent posts, so a new post also changes it.
      lastModified: newest(STATIC_LASTMOD.home, latestPost),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: newest(latestPost ?? STATIC_LASTMOD.home),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      // /docs itself 308s to /docs/introduction (Mintlify); list the target.
      // No lastmod: Mintlify's own /docs/sitemap.xml is the source of truth
      // for docs dates, and a hand-kept one here would drift from it.
      url: `${SITE_URL}/docs/introduction`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/signup`,
      lastModified: new Date(STATIC_LASTMOD.signup),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(STATIC_LASTMOD.privacy),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(STATIC_LASTMOD.terms),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  return [
    ...staticEntries,
    ...categoryEntries,
    ...authorEntries,
    ...blogEntries,
  ];
}
