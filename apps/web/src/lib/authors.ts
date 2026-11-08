import { SITE_URL } from '@/lib/site';

export interface AuthorLink {
  label: string;
  url: string;
}

export interface Author {
  slug: string;
  name: string;
  jobTitle: string;
  /** One-sentence summary used for the meta description and byline cards. */
  summary: string;
  /** Longer bio, one string per paragraph. */
  bio: string[];
  image: string;
  links: AuthorLink[];
  worksFor?: { name: string; url: string };
}

// Facts mirror Bahroze's author profile on bizofdev.com. Don't add
// credentials here that aren't stated there.
const AUTHORS: Author[] = [
  {
    slug: 'bahroze-ali',
    name: 'Bahroze Ali',
    jobTitle: 'Lead Product Engineer',
    summary:
      'Bahroze Ali builds OSForms, the open-source form backend, and is Lead Product Engineer at Biz of Dev, with 6+ years building web and mobile products.',
    bio: [
      "I'm Bahroze Ali. I build OSForms, the open-source form backend where you bring your own API keys.",
      "Day to day I'm Lead Product Engineer at Biz of Dev. For the last 6+ years I've built web and mobile products, taking them from a rough idea to something people actually use, and owning the build: architecture, build-versus-buy calls, and keeping the codebase fast to change.",
      'On this blog I write about handling form submissions without running a backend, wiring forms to the tools you already use, and keeping ownership of your data.',
    ],
    image: '/profile-pic.webp',
    links: [
      { label: 'GitHub', url: 'https://github.com/hawkeye-sama' },
      {
        label: 'Biz of Dev profile',
        url: 'https://bizofdev.com/authors/bahroze-ali',
      },
    ],
    worksFor: { name: 'Biz of Dev', url: 'https://bizofdev.com' },
  },
];

export function slugifyAuthor(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getAllAuthors(): Author[] {
  return AUTHORS;
}

export function getAuthorBySlug(slug: string): Author | null {
  return AUTHORS.find((a) => a.slug === slug) ?? null;
}

/** Looks up an author by the display name used in post frontmatter. */
export function getAuthorByName(name: string): Author | null {
  return getAuthorBySlug(slugifyAuthor(name));
}

export function authorUrl(author: Pick<Author, 'slug'>): string {
  return `${SITE_URL}/authors/${author.slug}`;
}
