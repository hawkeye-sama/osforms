import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote-client/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';

import { CursorGridGlow } from '@/components/blog/cursor-grid-glow';
import { Footer } from '@/components/layout/footer';
import { LandingNavbar } from '@/components/layout/landing-navbar';
import type { BlogPost } from '@/lib/blog';
import {
  formatDate,
  getAllPosts,
  getCoverUrl,
  getPostBySlug,
} from '@/lib/blog';
import { SITE_URL as BASE_URL } from '@/lib/site';

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

  const ogImages = [
    {
      url: `${BASE_URL}${getCoverUrl(post)}`,
      width: 1200,
      height: 630,
      alt: post.title,
    },
  ];

  const keywords = Array.from(
    new Set([
      ...(post.focusKeyphrase ? [post.focusKeyphrase] : []),
      ...post.tags,
    ])
  );

  return {
    title: post.seoTitle ?? post.title,
    description: post.description,
    ...(keywords.length > 0 && { keywords }),
    authors: [{ name: post.author }],
    alternates: {
      canonical: `${BASE_URL}/${slug}`,
    },
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.description,
      url: `${BASE_URL}/${slug}`,
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      modifiedTime: new Date(post.dateModified ?? post.date).toISOString(),
      authors: [post.author],
      tags: post.tags,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle ?? post.title,
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

function JsonLd({ post, slug }: { post: BlogPost; slug: string }) {
  // Author derives from frontmatter so on-page, OG, and JSON-LD signals agree.
  // A named person carries more E-E-A-T weight than a generic org byline.
  const author = {
    '@type': 'Person',
    name: post.author,
    url: 'https://github.com/hawkeye-sama',
    image: `${BASE_URL}/profile-pic.webp`,
    sameAs: ['https://github.com/hawkeye-sama'],
  };

  const blogPosting = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.dateModified ?? post.date).toISOString(),
    url: `${BASE_URL}/${slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/${slug}` },
    image: `${BASE_URL}${getCoverUrl(post)}`,
    ...(post.tags.length > 0 && { keywords: post.tags.join(', ') }),
    inLanguage: 'en',
    author,
    publisher: {
      '@type': 'Organization',
      name: 'OSForms',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
  };

  const breadcrumb = {
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
        name: post.title,
        item: `${BASE_URL}/${slug}`,
      },
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

  const morePosts = getAllPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, 2);

  return (
    <div className="dark bg-background text-foreground relative min-h-screen">
      <JsonLd post={post} slug={slug} />
      <div className="bg-grid-glow pointer-events-none fixed inset-0" />
      <CursorGridGlow />
      <LandingNavbar />

      <div className="relative px-6 pt-28 pb-24">
        <div className="mx-auto max-w-2xl">
          {/* ── Top bar ─────────────────────────── */}
          <div className="mb-12 flex items-center justify-between">
            <Link
              href="/blog"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 font-mono text-xs tracking-wide transition-colors"
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                ←
              </span>{' '}
              Blog
            </Link>
            <span className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
              {post.category}
            </span>
          </div>

          {/* ── Post Header ─────────────────────── */}
          <header className="mb-12">
            <h1 className="text-foreground text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">
              {post.title}
            </h1>

            <p className="text-muted-foreground mt-6 text-xl leading-relaxed">
              {post.description}
            </p>

            <div className="border-border mt-8 flex items-center gap-3 border-t pt-6">
              <Image
                src="/profile-pic.webp"
                alt={post.author}
                width={40}
                height={40}
                className="border-border h-10 w-10 rounded-full border object-cover"
              />
              <div className="text-sm leading-tight">
                <div className="text-foreground font-medium">{post.author}</div>
                <div className="text-muted-foreground font-mono text-xs">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span className="mx-1.5">·</span>
                  {post.readingTime}
                </div>
              </div>
            </div>
          </header>

          {/* ── Cover image ─────────────────────── */}
          <div className="border-border mb-14 overflow-hidden rounded-2xl border">
            <Image
              src={getCoverUrl(post)}
              alt={post.title}
              width={1200}
              height={630}
              className="h-auto w-full"
              priority
            />
          </div>

          {/* ── MDX Content ─────────────────────── */}
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

          {/* ── FAQ (rendered from frontmatter so it matches FAQPage JSON-LD) ── */}
          {post.faq && post.faq.length > 0 && (
            <section className="mt-20" aria-labelledby="faq-heading">
              <div className="text-muted-foreground mb-8 flex items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
                <span className="bg-foreground/60 h-px w-8" />
                <span>FAQ</span>
              </div>
              <h2 id="faq-heading" className="sr-only">
                Frequently Asked Questions
              </h2>
              <div className="border-border border-t">
                {post.faq.map((item, i) => (
                  <div
                    key={item.question}
                    className="border-border grid grid-cols-[2rem_1fr] gap-x-4 border-b py-6"
                  >
                    <span className="text-muted-foreground/70 font-mono text-sm tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-foreground mb-2 font-semibold">
                        {item.question}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Continue reading ────────────────── */}
          {morePosts.length > 0 && (
            <section className="mt-20" aria-labelledby="more-heading">
              <div className="text-muted-foreground mb-8 flex items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
                <span className="bg-foreground/60 h-px w-8" />
                <span id="more-heading">Continue reading</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {morePosts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/${p.slug}`}
                    className="group border-border bg-card/40 hover:bg-card/60 flex flex-col rounded-2xl border p-6 transition-colors duration-200"
                  >
                    <div className="text-muted-foreground flex items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
                      <span>{p.category}</span>
                      <span className="text-muted-foreground/50">·</span>
                      <time dateTime={p.date}>{formatDate(p.date)}</time>
                    </div>
                    <h3 className="text-foreground mt-3 text-lg font-semibold tracking-tight transition-opacity group-hover:opacity-70">
                      {p.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
                      {p.description}
                    </p>
                    <span className="text-foreground mt-4 inline-flex items-center gap-1.5 font-mono text-xs">
                      Read
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── CTA ─────────────────────────────── */}
          <div className="border-border bg-card/30 mt-20 rounded-2xl border p-8 text-center sm:p-10">
            <h3 className="text-foreground text-xl font-bold tracking-tight">
              Own your form backend
            </h3>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
              Bring your own API keys. 100 free submissions a month, every
              integration included, no lock-in.
            </p>
            <Link
              href="/signup"
              className="bg-foreground text-background mt-6 inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Get Started Free →
            </Link>
          </div>

          {/* ── Tags ────────────────────────────── */}
          {post.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="border-border text-muted-foreground rounded-md border px-2.5 py-0.5 font-mono text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* ── Post Footer ─────────────────────── */}
          <div className="border-border mt-10 flex items-center justify-between border-t pt-8">
            <Link
              href="/blog"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 font-mono text-xs tracking-wide transition-colors"
            >
              ← All posts
            </Link>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${BASE_URL}/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground font-mono text-xs tracking-wide transition-colors"
            >
              Share on X →
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
