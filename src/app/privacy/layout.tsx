import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'OSForms Privacy Policy. Learn how we collect, use, and protect your information when you use our open-source form backend service.',
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
