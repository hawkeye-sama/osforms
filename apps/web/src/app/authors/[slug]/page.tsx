import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CursorGridGlow } from '@/components/blog/cursor-grid-glow';
import { Footer } from '@/components/layout/footer';
import { LandingNavbar } from '@/components/layout/landing-navbar';
import { authorUrl, getAllAuthors, getAuthorBySlug } from '@/lib/authors';
import { formatDate, getAllPosts } from '@/lib/blog';
import { SITE_URL as BASE_URL } from '@/lib/site';
import { personSchema, WEBSITE_ID } from '@/lib/structured-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllAuthors().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) {
    return {};
  }

  const url = authorUrl(author);
  const title = `${author.name}, ${author.jobTitle}`;
  return {
    title,
    description: author.summary,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | OSForms`,
      description: author.summary,
      url,
      type: 'profile',
      images: [{ url: `${BASE_URL}${author.image}`, alt: author.name }],
    },
    twitter: {
      card: 'summary',
      title: `${title} | OSForms`,
      description: author.summary,
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) {
    notFound();
  }

  const posts = getAllPosts().filter((p) => p.author === author.name);
  const url = authorUrl(author);

  const profilePage = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${url}#profile`,
    url,
    name: `${author.name}, ${author.jobTitle}`,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: personSchema(author),
    hasPart: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${BASE_URL}/${post.slug}`,
      datePublished: new Date(post.date).toISOString(),
    })),
  };

  return (
    <div className="dark bg-background text-foreground relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePage) }}
      />
      <div className="bg-grid-glow pointer-events-none fixed inset-0" />
      <CursorGridGlow />
      <LandingNavbar />

      <main className="relative px-6 pt-36 pb-24 sm:pt-44">
        <div className="mx-auto max-w-3xl">
          <header className="flex flex-col gap-8 sm:flex-row sm:items-start">
            <Image
              src={author.image}
              alt={author.name}
              width={112}
              height={112}
              className="border-border h-28 w-28 shrink-0 rounded-full border object-cover"
              priority
            />
            <div>
              <div className="text-muted-foreground mb-3 font-mono text-xs tracking-widest uppercase">
                Author
              </div>
              <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
                {author.name}
              </h1>
              <p className="text-muted-foreground mt-3 text-lg">
                {author.jobTitle}
                {author.worksFor && (
                  <>
                    {' '}
                    at{' '}
                    <a
                      href={author.worksFor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:opacity-70"
                    >
                      {author.worksFor.name}
                    </a>
                  </>
                )}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {author.links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="me noopener noreferrer"
                      className="border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 inline-flex rounded-md border px-3 py-1 font-mono text-xs transition-colors"
                    >
                      {link.label} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </header>

          <section className="mt-14 space-y-4" aria-label="About">
            {author.bio.map((paragraph) => (
              <p
                key={paragraph}
                className="text-muted-foreground text-lg leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </section>

          {posts.length > 0 && (
            <section className="mt-20" aria-labelledby="posts-heading">
              <div className="text-muted-foreground mb-8 flex items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
                <span className="bg-foreground/60 h-px w-8" />
                <h2 id="posts-heading">Articles by {author.name}</h2>
                <span className="text-muted-foreground/70">
                  ({String(posts.length).padStart(2, '0')})
                </span>
              </div>
              <ul className="border-border border-t">
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/${post.slug}`}
                      className="group border-border hover:bg-card/40 block border-b px-2 py-6 transition-colors duration-200"
                    >
                      <div className="text-muted-foreground mb-2 flex items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
                        <span>{post.category}</span>
                        <span className="text-muted-foreground/30">·</span>
                        <time dateTime={post.date}>
                          {formatDate(post.date)}
                        </time>
                      </div>
                      <h3 className="text-foreground text-lg font-semibold tracking-tight transition-opacity group-hover:opacity-70">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-relaxed">
                        {post.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
