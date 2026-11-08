import type { Metadata } from 'next';

import { SITE_URL } from '@/lib/site';

const TITLE = 'Log In';
const DESCRIPTION =
  'Log in to your OSForms dashboard to manage your forms, submissions, and integrations.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE_URL}/login` },
  openGraph: {
    title: `${TITLE} | OSForms`,
    description: DESCRIPTION,
    url: `${SITE_URL}/login`,
  },
  twitter: {
    title: `${TITLE} | OSForms`,
    description: DESCRIPTION,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
