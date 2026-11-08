import type { Metadata } from 'next';

import { SITE_URL } from '@/lib/site';

const TITLE = 'Sign Up Free';
const DESCRIPTION =
  'Create a free OSForms account: a form endpoint in minutes, 100 free submissions/month, and Resend, Google Sheets, and webhooks on your own keys.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/signup` },
  openGraph: {
    title: `${TITLE} | OSForms`,
    description: DESCRIPTION,
    url: `${SITE_URL}/signup`,
  },
  twitter: {
    title: `${TITLE} | OSForms`,
    description: DESCRIPTION,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
