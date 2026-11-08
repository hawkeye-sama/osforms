import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { CursorGridGlow } from '@/components/blog/cursor-grid-glow';
import { Footer } from '@/components/layout/footer';
import { LandingNavbar } from '@/components/layout/landing-navbar';
import { formatDate } from '@/lib/blog';
import {
  GLOSSARY_TERMS,
  GLOSSARY_UPDATED,
  termLetter,
  type GlossaryLink,
  type GlossaryTerm,
} from '@/lib/glossary';
import { SITE_URL } from '@/lib/site';
import {
  GITHUB_REPO_URL,
  ORGANIZATION_ID,
  WEBSITE_ID,
} from '@/lib/structured-data';

const PAGE_URL = `${SITE_URL}/glossary`;
const TERM_SET_ID = `${PAGE_URL}#termset`;
const TERM_COUNT = GLOSSARY_TERMS.length;

// The root layout's title template appends "| OSForms".
const TITLE = `Form Backend Glossary: ${TERM_COUNT} Terms Explained`;
const DESCRIPTION = `Plain definitions of ${TERM_COUNT} form backend terms, from honeypot fields and CAPTCHA to CORS, webhooks, HMAC signatures, BYOK, and the Post/Redirect/Get pattern.`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `${TITLE} | OSForms`,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    siteName: 'OSForms',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'OSForms form backend glossary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | OSForms`,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** Terms grouped by first letter, in A to Z order. */
const GROUPS: Array<{ letter: string; terms: GlossaryTerm[] }> = ALPHABET.map(
  (letter) => ({
    letter,
    terms: GLOSSARY_TERMS.filter((t) => termLetter(t) === letter),
  })
).filter((g) => g.terms.length > 0);

const LETTERS_WITH_TERMS = new Set(GROUPS.map((g) => g.letter));

const FURTHER_READING: GlossaryLink[] = [
  {
    href: '/handle-form-submissions',
    label: 'How to handle form submissions without a backend',
  },
  {
    href: '/form-backend-setup',
    label: 'What is a form backend? (And how to set one up)',
  },
  {
    href: '/formspree-alternative',
    label: 'Formspree alternatives: 7 form backends compared',
  },
  {
    href: '/typeform-alternative',
    label: 'An open source Typeform alternative for React',
  },
];

function schemas() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'DefinedTermSet',
      '@id': TERM_SET_ID,
      name: 'Form Backend Glossary',
      description: DESCRIPTION,
      url: PAGE_URL,
      inLanguage: 'en',
      dateModified: GLOSSARY_UPDATED,
      isPartOf: { '@id': WEBSITE_ID },
      publisher: { '@id': ORGANIZATION_ID },
      hasDefinedTerm: GLOSSARY_TERMS.map((t) => ({
        '@type': 'DefinedTerm',
        '@id': `${PAGE_URL}#${t.slug}`,
        name: t.term,
        description: t.definition,
        url: `${PAGE_URL}#${t.slug}`,
        inDefinedTermSet: { '@id': TERM_SET_ID },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Glossary',
          item: PAGE_URL,
        },
      ],
    },
  ];
}

/** JSON for a <script> tag; escapes "<" so content can never close the tag. */
function toJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/** Render `backtick` spans as <code>; everything else stays plain text. */
function renderInline(text: string): ReactNode[] {
  return text.split('`').map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={i}
        className="bg-card border-border text-foreground rounded border px-1.5 py-0.5 font-mono text-[0.85em]"
      >
        {part}
      </code>
    ) : (
      part
    )
  );
}

const LINK_CLASS =
  'text-foreground decoration-border hover:decoration-foreground underline underline-offset-4 transition-colors';

function ResourceLink({ link }: { link: GlossaryLink }) {
  const content = (
    <>
      {link.label}
      <span aria-hidden="true"> →</span>
    </>
  );

  if (link.href.startsWith('http')) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK_CLASS}
      >
        {content}
      </a>
    );
  }
  // /docs/* is rewritten to Mintlify, so it needs a full page load.
  if (link.href.startsWith('/docs')) {
    return (
      <a href={link.href} className={LINK_CLASS}>
        {content}
      </a>
    );
  }
  return (
    <Link href={link.href} className={LINK_CLASS}>
      {content}
    </Link>
  );
}

function TermEntry({ term }: { term: GlossaryTerm }) {
  return (
    <article className="border-border border-b py-10 last:border-b-0">
      <h2
        id={term.slug}
        className="group text-foreground scroll-mt-40 text-2xl font-semibold tracking-tight"
      >
        {term.term}
        <a
          href={`#${term.slug}`}
          aria-label={`Link to ${term.term}`}
          className="text-muted-foreground hover:text-foreground ml-2 font-mono text-base font-normal opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          #
        </a>
      </h2>

      <p className="text-foreground mt-4 text-lg leading-relaxed">
        {term.definition}
      </p>

      <p className="text-muted-foreground mt-4 leading-relaxed">
        {renderInline(term.context)}
      </p>

      {term.osforms && (
        <div className="border-border bg-card/40 mt-5 rounded-lg border px-4 py-3">
          <p className="text-muted-foreground text-sm leading-relaxed">
            <span className="text-foreground font-semibold">In OSForms: </span>
            {renderInline(term.osforms)}
          </p>
        </div>
      )}

      <p className="mt-4 text-sm">
        <span className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
          Read next:{' '}
        </span>
        <ResourceLink link={term.link} />
      </p>
    </article>
  );
}

export default function GlossaryPage() {
  return (
    <div className="dark bg-background text-foreground relative min-h-screen">
      {schemas().map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }}
        />
      ))}
      <div className="bg-grid-glow pointer-events-none fixed inset-0" />
      <CursorGridGlow />
      <LandingNavbar />

      <main className="relative px-6 pt-36 pb-24 sm:pt-44">
        <div className="mx-auto max-w-3xl">
          <nav
            aria-label="Breadcrumb"
            className="text-muted-foreground mb-6 flex items-center gap-2 font-mono text-xs tracking-widest uppercase"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground">Glossary</span>
          </nav>

          <header className="mb-12">
            <h1 className="text-foreground text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              Form Backend Glossary
            </h1>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
              Short, exact definitions of {TERM_COUNT} terms you run into when
              you wire a web form to a backend: body encodings, spam defenses,
              webhooks, and data ownership. Each entry opens with a one-line
              definition, then covers what it means for a real form and how
              OSForms handles it.
            </p>
            <p className="text-muted-foreground mt-4 font-mono text-xs">
              Updated{' '}
              <time dateTime={GLOSSARY_UPDATED}>
                {formatDate(GLOSSARY_UPDATED)}
              </time>
            </p>
          </header>

          {/* ── A to Z jump nav ─────────────────── */}
          <nav
            aria-label="Glossary letters"
            className="border-border bg-background/80 sticky top-16 z-10 -mx-2 mb-8 border-y px-2 py-3 backdrop-blur-xl"
          >
            <ul className="flex flex-wrap gap-1">
              {ALPHABET.map((letter) =>
                LETTERS_WITH_TERMS.has(letter) ? (
                  <li key={letter}>
                    <a
                      href={`#letter-${letter.toLowerCase()}`}
                      className="text-foreground hover:bg-secondary flex h-9 w-9 items-center justify-center rounded-md font-mono text-sm font-semibold transition-colors"
                    >
                      {letter}
                    </a>
                  </li>
                ) : (
                  <li key={letter}>
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground/40 flex h-9 w-9 items-center justify-center font-mono text-sm"
                    >
                      {letter}
                    </span>
                  </li>
                )
              )}
            </ul>
          </nav>

          {/* ── Term index ──────────────────────── */}
          <nav aria-label="All terms" className="mb-16">
            <ul className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              {GLOSSARY_TERMS.map((t) => (
                <li key={t.slug}>
                  <a
                    href={`#${t.slug}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.term}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Terms ───────────────────────────── */}
          {GROUPS.map((group) => (
            <section
              key={group.letter}
              aria-labelledby={`letter-${group.letter.toLowerCase()}`}
              className="mb-6"
            >
              <div
                id={`letter-${group.letter.toLowerCase()}`}
                className="text-muted-foreground mb-2 flex scroll-mt-40 items-center gap-3 font-mono text-sm tracking-widest"
              >
                <span className="bg-foreground/60 h-px w-8" />
                <span>{group.letter}</span>
              </div>
              {group.terms.map((term) => (
                <TermEntry key={term.slug} term={term} />
              ))}
            </section>
          ))}

          {/* ── Further reading ─────────────────── */}
          <section className="mt-16" aria-labelledby="further-reading">
            <h2
              id="further-reading"
              className="text-foreground text-xl font-semibold tracking-tight"
            >
              Go further
            </h2>
            <ul className="mt-4 space-y-2">
              {FURTHER_READING.map((link) => (
                <li key={link.href}>
                  <ResourceLink link={link} />
                </li>
              ))}
            </ul>
          </section>

          {/* ── CTA ─────────────────────────────── */}
          <div className="border-border bg-card/30 mt-16 rounded-2xl border p-8 text-center sm:p-10">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              Point your form at OSForms
            </h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
              Bring your own API keys. 100 free submissions a month, with
              Resend, Google Sheets, and webhooks included.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="bg-foreground text-background inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              >
                Get Started Free →
              </Link>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="border-border text-foreground hover:bg-secondary inline-flex items-center gap-1.5 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
              >
                ★ Star on GitHub
              </a>
            </div>
            <p className="text-muted-foreground mt-3 text-xs">
              Open source (MIT). Self-host it if you prefer.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
