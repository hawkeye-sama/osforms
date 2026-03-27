import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'OSForms Terms of Service. Read our terms and conditions for using the open-source form backend platform.',
  openGraph: {
    title: 'Terms of Service | OSForms',
    description:
      'OSForms Terms of Service. Read our terms and conditions for using the open-source form backend platform.',
  },
  twitter: {
    title: 'Terms of Service | OSForms',
    description:
      'OSForms Terms of Service. Read our terms and conditions for using the open-source form backend platform.',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
