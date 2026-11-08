import type { Author } from '@/lib/authors';
import { authorUrl } from '@/lib/authors';
import { SITE_URL } from '@/lib/site';

/** Stable JSON-LD node ids so pages can reference the site-wide entities. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const GITHUB_REPO_URL = 'https://github.com/hawkeye-sama/osforms';

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'OSForms',
    url: SITE_URL,
    description:
      'OSForms is an open-source (MIT) form backend for HTML and React forms. Submissions are stored and forwarded to your own Resend email, Google Sheets, and webhooks using your API keys.',
    disambiguatingDescription:
      'Open-source form backend at osforms.com. Not related to OS2Forms, Open Forms, or OpnForm.',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
    },
    // Add directory/launch profiles here as they go live (AlternativeTo,
    // dev.to, Product Hunt, Hacker News) to strengthen entity matching.
    sameAs: [GITHUB_REPO_URL, 'https://www.npmjs.com/package/@osforms/react'],
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'OSForms',
    url: SITE_URL,
    inLanguage: 'en',
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function personId(author: Pick<Author, 'slug'>): string {
  return `${authorUrl(author)}#person`;
}

export function personSchema(author: Author) {
  return {
    '@type': 'Person',
    '@id': personId(author),
    name: author.name,
    url: authorUrl(author),
    image: `${SITE_URL}${author.image}`,
    jobTitle: author.jobTitle,
    description: author.summary,
    ...(author.worksFor && {
      worksFor: {
        '@type': 'Organization',
        name: author.worksFor.name,
        url: author.worksFor.url,
      },
    }),
    sameAs: author.links.map((l) => l.url),
  };
}
