import type { Metadata } from 'next';

import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'OSForms Privacy Policy. Learn how we collect, use, and protect your information when you use our open-source form backend service.',
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: 'Privacy Policy | OSForms',
    description:
      'OSForms Privacy Policy. Learn how we collect, use, and protect your information when you use our open-source form backend service.',
  },
  twitter: {
    title: 'Privacy Policy | OSForms',
    description:
      'OSForms Privacy Policy. Learn how we collect, use, and protect your information when you use our open-source form backend service.',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
