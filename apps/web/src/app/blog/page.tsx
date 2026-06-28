import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { formatDate, getAllPosts, getCoverUrl } from '@/lib/blog';
import { SITE_URL as BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Tutorials, guides, and insights on form backends, BYOK integrations, and developer tools from the OSForms team.',
  alternates: {
    canonical: `${BASE_URL}/blog`,
    types: {
      'application/rss+xml': `${BASE_URL}/feed.xml`,
    },
  },
  openGraph: {
    title: 'OSForms Blog',
    description:
      'Tutorials, comparisons, and opinions on form backends, BYOK integrations, and building for developers.',
    url: `${BASE_URL}/blog`,
    type: 'website',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  const categories = Array.from(
    posts.reduce(
      (m, p) => m.set(p.category, (m.get(p.category) ?? 0) + 1),
      new Map<string, number>()
    ),
    ([name, count]) => ({ name, count })
  );

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'OSForms Blog',
    description:
      'Tutorials, comparisons, and opinions on form backends, BYOK integrations, and building for developers.',
    url: `${BASE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'OSForms',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      url: `${BASE_URL}/${post.slug}`,
      datePublished: post.date,
      dateModified: post.dateModified ?? post.date,
    })),
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((post, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE_URL}/${post.slug}`,
      name: post.title,
    })),
  };

  return (
    <div className="relative px-6 py-20 sm:py-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="mx-auto max-w-5xl">
        {/* ── Header ─────────────────────────────── */}
        <header className="mb-16 grid gap-10 lg:grid-cols-[1fr_15rem] lg:items-start">
          <div>
            <div className="text-muted-foreground mb-6 flex items-center gap-3 font-mono text-xs tracking-widest uppercase">
              <span className="bg-foreground/60 h-px w-8" />
              <span>Writing</span>
              <span className="text-muted-foreground/70">
                ({String(posts.length).padStart(2, '0')})
              </span>
            </div>
            <h1 className="text-foreground text-5xl font-bold tracking-tight sm:text-7xl">
              Blog
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed text-balance">
              Tutorials, comparisons, and opinions on form backends, BYOK
              integrations, and building for developers — from the team behind
              OSForms.
            </p>
          </div>

          {categories.length > 0 && (
            <aside className="border-border bg-card/40 rounded-2xl border p-5 lg:mt-2">
              <div className="text-muted-foreground mb-4 font-mono text-[11px] tracking-widest uppercase">
                Topics
              </div>
              <ul className="space-y-2.5">
                {categories.map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground">{c.name}</span>
                    <span className="text-muted-foreground font-mono text-xs tabular-nums">
                      {String(c.count).padStart(2, '0')}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href="/feed.xml"
                className="border-border text-muted-foreground hover:text-foreground mt-5 flex items-center gap-1.5 border-t pt-4 font-mono text-xs tracking-wide transition-colors"
              >
                RSS feed →
              </a>
            </aside>
          )}
        </header>

        {/* ── Featured (latest) ──────────────────── */}
        {featured && (
          <Link
            href={`/${featured.slug}`}
            className="group bg-card/40 border-border hover:bg-card/60 relative block overflow-hidden rounded-2xl border transition-colors duration-300"
          >
            <div className="grid items-stretch lg:grid-cols-[1.1fr_1fr]">
              <div className="flex flex-col justify-center gap-5 p-8 sm:p-10">
                <div className="text-muted-foreground flex items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
                  <span className="text-foreground">Latest</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span>{featured.category}</span>
                </div>

                <h2 className="text-foreground text-2xl leading-snug font-bold tracking-tight transition-opacity group-hover:opacity-80 sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {featured.description}
                </p>
                <div className="text-muted-foreground mt-1 flex items-center gap-3 font-mono text-xs">
                  <time dateTime={featured.date}>
                    {formatDate(featured.date)}
                  </time>
                  <span className="text-muted-foreground/50">·</span>
                  <span>{featured.readingTime}</span>
                  <span className="text-foreground ml-auto inline-flex items-center transition-transform duration-300 group-hover:translate-x-1">
                    Read →
                  </span>
                </div>
              </div>

              <div className="border-border bg-background relative min-h-60 overflow-hidden border-t lg:border-t-0 lg:border-l">
                <Image
                  src={getCoverUrl(featured)}
                  alt={featured.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </Link>
        )}

        {/* ── Indexed list ───────────────────────── */}
        {rest.length > 0 && (
          <ul className="border-border mt-16 border-t">
            {rest.map((post, i) => (
              <li key={post.slug}>
                <Link
                  href={`/${post.slug}`}
                  className="group border-border hover:bg-card/40 grid grid-cols-[auto_1fr] items-baseline gap-x-5 border-b px-2 py-7 transition-colors duration-200 sm:grid-cols-[3rem_1fr_auto] sm:gap-x-8"
                >
                  <span className="text-muted-foreground/70 group-hover:text-muted-foreground font-mono text-sm tabular-nums transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0">
                    <div className="text-muted-foreground mb-2 flex items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
                      <span>{post.category}</span>
                      <span className="text-muted-foreground/30">·</span>
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </div>
                    <h3 className="text-foreground text-xl font-semibold tracking-tight transition-opacity group-hover:opacity-70">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed">
                      {post.description}
                    </p>
                  </div>

                  <div className="text-muted-foreground/50 col-start-2 mt-3 flex items-center gap-4 font-mono text-xs sm:col-start-3 sm:mt-0 sm:self-center">
                    <span className="hidden sm:inline">{post.readingTime}</span>
                    <span className="text-foreground inline-flex translate-x-0 items-center transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {posts.length === 0 && (
          <p className="text-muted-foreground font-mono text-sm">
            No posts yet.
          </p>
        )}
      </div>
    </div>
  );
}
