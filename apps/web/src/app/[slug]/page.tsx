import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';

import { Footer } from '@/components/layout/footer';
import { LandingNavbar } from '@/components/layout/landing-navbar';
import type { BlogPost } from '@/lib/blog';
import { formatDate, getAllPosts, getPostBySlug } from '@/lib/blog';

const BASE_URL = 'https://osforms.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return {};
  }

  const ogImages = post.coverImage
    ? [{ url: `${BASE_URL}${post.coverImage}`, width: 1200, height: 630, alt: post.title }]
    : [];

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `${BASE_URL}/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.dateModified ?? post.date,
      authors: [post.author],
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: ogImages.map((img) => img.url),
    },
  };
}

function BlogImage({
  src,
  alt,
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) {
    return null;
  }
  return (
    <span className="border-border my-8 block overflow-hidden rounded-xl border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt ?? ''} className="h-auto w-full" {...rest} />
    </span>
  );
}

const MDX_COMPONENTS = {
  img: BlogImage,
};

const CATEGORY_COLORS: Record<string, string> = {
  Build: 'border-border text-muted-foreground',
  Integrate: 'border-border text-muted-foreground',
  Ship: 'border-border text-muted-foreground',
  Compare: 'border-border text-muted-foreground',
  'BYOK Files': 'border-border text-foreground',
};

function JsonLd({ post, slug }: { post: BlogPost; slug: string }) {
  const blogPosting = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.dateModified ?? post.date,
    url: `${BASE_URL}/${slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/${slug}` },
    ...(post.coverImage && { image: `${BASE_URL}${post.coverImage}` }),
    author: {
      '@type': 'Person',
      name: 'Bahroze Ali',
      url: 'https://github.com/hawkeye-sama',
      sameAs: ['https://github.com/hawkeye-sama'],
    },
    publisher: {
      '@type': 'Organization',
      name: 'osforms',
      url: BASE_URL,
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: `${BASE_URL}/blog` },
      { '@type': 'ListItem', position: 2, name: post.title, item: `${BASE_URL}/${slug}` },
    ],
  };

  const schemas: object[] = [blogPosting, breadcrumb];

  if (post.faq && post.faq.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faq.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return (
    <div className="dark bg-background text-foreground relative min-h-screen">
      <JsonLd post={post} slug={slug} />
      <div className="bg-grid-glow pointer-events-none fixed inset-0" />
      <LandingNavbar />

      <div className="relative pt-16">
        <div className="mx-auto max-w-6xl px-8">
          {/* ── Breadcrumb ──────────────────────── */}
          <div className="border-border/40 flex items-center gap-2 border-b py-5 text-sm">
            <Link
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.Build}`}
            >
              {post.category}
            </span>
          </div>

          <div className="mx-auto max-w-2xl py-16">
            {/* ── Post Header ─────────────────── */}
            <header className="mb-12">
              <div className="text-muted-foreground mb-5 flex flex-wrap items-center gap-3 text-sm">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span className="text-muted-foreground/40">·</span>
                <span>{post.readingTime}</span>
                <span className="text-muted-foreground/40">·</span>
                <span>{post.author}</span>
              </div>

              <h1 className="text-foreground mb-4 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
                {post.title}
              </h1>

              <p className="text-muted-foreground text-lg leading-relaxed">
                {post.description}
              </p>

              {post.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border-border bg-card text-muted-foreground rounded-md border px-2.5 py-0.5 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* ── Cover image ─────────────────── */}
            {post.coverImage && (
              <div className="border-border mb-12 overflow-hidden rounded-xl border">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  width={1200}
                  height={630}
                  className="h-auto w-full"
                  priority
                />
              </div>
            )}

            {/* ── Divider (only when no cover image) ── */}
            {!post.coverImage && (
              <div className="via-border mb-12 h-px bg-linear-to-r from-transparent to-transparent" />
            )}

            {/* ── MDX Content ─────────────────── */}
            <article className="blog-content">
              <MDXRemote
                source={post.content}
                components={MDX_COMPONENTS}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [
                      [
                        rehypePrettyCode,
                        {
                          theme: 'github-dark-dimmed',
                          keepBackground: false,
                        },
                      ],
                    ],
                  },
                }}
              />
            </article>

            {/* ── Post Footer ─────────────────── */}
            <div className="border-border/40 mt-20 flex items-center justify-between border-t pt-8">
              <Link
                href="/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
              >
                ← All Posts
              </Link>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${BASE_URL}/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Share on X →
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
