import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';

import { Footer } from '@/components/layout/footer';
import { LandingNavbar } from '@/components/layout/landing-navbar';
import { formatDate, getAllPosts, getPostBySlug } from '@/lib/blog';

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

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      title: post.title,
      description: post.description,
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

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return (
    <div className="dark bg-background text-foreground relative min-h-screen">
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

            {/* ── Divider ─────────────────────── */}
            <div className="via-border mb-12 h-px bg-linear-to-r from-transparent to-transparent" />

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
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://osforms.com/${post.slug}`)}`}
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
