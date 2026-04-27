import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { formatDate, getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Tutorials, guides, and insights on form backends, BYOK integrations, and developer tools from the osforms team.',
};

const CATEGORY_STYLES: Record<string, string> = {
  Build: 'bg-card border-border text-muted-foreground',
  Integrate: 'bg-card border-border text-muted-foreground',
  Ship: 'bg-card border-border text-muted-foreground',
  Compare: 'bg-card border-border text-muted-foreground',
  'BYOK Files': 'bg-card border-border text-foreground',
};

export default function BlogPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="px-8 py-20">
      <div className="mx-auto max-w-6xl px-8">
        {/* ── Page Header ────────────────────────── */}
        <div className="mb-16 max-w-xl">
          <p className="text-muted-foreground mb-3 text-sm font-medium tracking-widest uppercase">
            From the team
          </p>
          <h1 className="text-foreground text-5xl font-bold tracking-tight">
            Blog
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Tutorials, comparisons, and opinions on form backends, BYOK
            integrations, and building for developers.
          </p>
        </div>

        {posts.length === 0 && (
          <p className="text-muted-foreground text-sm">No posts yet.</p>
        )}

        {/* ── Featured Post ───────────────────────── */}
        {featured && (
          <Link
            href={`/${featured.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group mb-8 block"
          >
            <article className="border-border bg-card/40 hover:bg-card/70 relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]">
              {/* top accent line */}
              <div className="from-border via-foreground/20 to-border absolute inset-x-0 top-0 h-px bg-linear-to-r" />

              <div className="flex flex-col lg:flex-row">
                {/* Text side */}
                <div className="flex flex-1 flex-col justify-center p-8 sm:p-10">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[featured.category] ?? CATEGORY_STYLES.Build}`}
                    >
                      {featured.category}
                    </span>
                    <span className="text-muted-foreground text-sm">Latest</span>
                  </div>

                  <h2 className="text-foreground mb-3 text-2xl font-bold leading-snug tracking-tight transition-colors group-hover:opacity-80 sm:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {featured.description}
                  </p>

                  <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-4 text-sm">
                    <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                    <span>·</span>
                    <span>{featured.readingTime}</span>
                    {featured.tags.length > 0 && (
                      <>
                        <span>·</span>
                        <div className="flex gap-2">
                          {featured.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="border-border bg-background rounded px-2 py-0.5 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <span className="text-muted-foreground group-hover:text-foreground mt-6 inline-flex w-fit items-center gap-1 text-sm transition-colors">
                    Read article →
                  </span>
                </div>

                {/* Cover image side */}
                {featured.coverImage && (
                  <div className="border-border/40 relative hidden h-64 w-full overflow-hidden border-t lg:block lg:h-auto lg:w-96 lg:border-t-0 lg:border-l xl:w-120">
                    <Image
                      src={featured.coverImage}
                      alt={featured.title}
                      fill
                      className="object-cover object-left opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                    />
                  </div>
                )}
              </div>
            </article>
          </Link>
        )}

        {/* ── Remaining Posts Grid ────────────────── */}
        {rest.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <article className="border-border bg-card/40 hover:bg-card/70 flex h-full flex-col overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,255,255,0.04)]">
                  {/* Cover image thumbnail */}
                  {post.coverImage && (
                    <div className="border-border/40 relative h-40 w-full overflow-hidden border-b">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover object-left opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLES[post.category] ?? CATEGORY_STYLES.Build}`}
                      >
                        {post.category}
                      </span>
                      <time dateTime={post.date} className="text-muted-foreground text-xs">
                        {formatDate(post.date)}
                      </time>
                    </div>

                    <h2 className="text-foreground mb-2 flex-1 text-base font-semibold leading-snug tracking-tight group-hover:opacity-80">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">
                      {post.description}
                    </p>

                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>{post.readingTime}</span>
                      <span className="group-hover:text-foreground transition-colors">Read →</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
