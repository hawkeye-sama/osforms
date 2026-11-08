import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CursorGridGlow } from '@/components/blog/cursor-grid-glow';
import { Footer } from '@/components/layout/footer';
import { LandingNavbar } from '@/components/layout/landing-navbar';
import {
  formatDate,
  getAllCategories,
  getCategoryBySlug,
  getPostsByCategory,
} from '@/lib/blog';
import { SITE_URL as BASE_URL } from '@/lib/site';
import { WEBSITE_ID } from '@/lib/structured-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) {
    return {};
  }

  const url = `${BASE_URL}/category/${category.slug}`;
  return {
    title: category.title,
    description: category.intro,
    alternates: { canonical: url },
    openGraph: {
      title: `${category.title} | OSForms`,
      description: category.intro,
      url,
      type: 'website',
    },
    twitter: {
      title: `${category.title} | OSForms`,
      description: category.intro,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  const posts = getPostsByCategory(slug);
  if (!category || posts.length === 0) {
    notFound();
  }

  const url = `${BASE_URL}/category/${category.slug}`;
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': url,
      url,
      name: category.title,
      description: category.intro,
      isPartOf: { '@id': WEBSITE_ID },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: posts.map((post, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${BASE_URL}/${post.slug}`,
          name: post.title,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Blog',
          item: `${BASE_URL}/blog`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: category.name,
          item: url,
        },
      ],
    },
  ];

  return (
    <div className="dark bg-background text-foreground relative min-h-screen">
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div className="bg-grid-glow pointer-events-none fixed inset-0" />
      <CursorGridGlow />
      <LandingNavbar />

      <main className="relative px-6 pt-36 pb-24 sm:pt-44">
        <div className="mx-auto max-w-5xl">
          <nav
            aria-label="Breadcrumb"
            className="text-muted-foreground mb-6 flex items-center gap-2 font-mono text-xs tracking-widest uppercase"
          >
            <Link
              href="/blog"
              className="hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground">{category.name}</span>
            <span className="text-muted-foreground/70">
              ({String(posts.length).padStart(2, '0')})
            </span>
          </nav>

          <header className="mb-16">
            <h1 className="text-foreground text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              {category.title}
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed text-balance">
              {category.intro}
            </p>
          </header>

          <ul className="border-border border-t">
            {posts.map((post, i) => (
              <li key={post.slug}>
                <Link
                  href={`/${post.slug}`}
                  className="group border-border hover:bg-card/40 grid grid-cols-[auto_1fr] items-baseline gap-x-5 border-b px-2 py-7 transition-colors duration-200 sm:grid-cols-[3rem_1fr_auto] sm:gap-x-8"
                >
                  <span className="text-muted-foreground/70 group-hover:text-muted-foreground font-mono text-sm tabular-nums transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0">
                    <div className="text-muted-foreground mb-2 font-mono text-[11px] tracking-widest uppercase">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </div>
                    <h2 className="text-foreground text-xl font-semibold tracking-tight transition-opacity group-hover:opacity-70">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed">
                      {post.description}
                    </p>
                  </div>

                  <div className="text-muted-foreground/50 col-start-2 mt-3 flex items-center gap-4 font-mono text-xs sm:col-start-3 sm:mt-0 sm:self-center">
                    <span className="hidden sm:inline">{post.readingTime}</span>
                    <span className="text-foreground inline-flex items-center transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground mt-10 inline-flex items-center gap-1.5 font-mono text-xs tracking-wide transition-colors"
          >
            ← All posts
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
