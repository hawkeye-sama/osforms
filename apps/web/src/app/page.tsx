import type { Metadata } from 'next';

import { HOME_FAQ } from '@/components/landing/faq-items';
import { LandingPage } from '@/components/landing/landing-page';
import { formatDate, getAllPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/site';

const HOME_TITLE = 'OSForms: Open-Source Form Backend for HTML & React Forms';
const HOME_DESCRIPTION =
  'OSForms is the open-source form backend where you bring your own API keys. Send submissions to Resend, Google Sheets, and webhooks. 100 free submissions/month.';

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
    types: {
      'application/rss+xml': `${SITE_URL}/feed.xml`,
    },
  },
};

export default function HomePage() {
  const recentPosts = getAllPosts()
    .slice(0, 6)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      category: post.category,
      date: post.date,
      dateLabel: formatDate(post.date),
    }));

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingPage recentPosts={recentPosts} />
    </>
  );
}
