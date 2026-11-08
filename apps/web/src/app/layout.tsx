import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';

import { SITE_URL } from '@/lib/site';
import {
  ORGANIZATION_ID,
  organizationSchema,
  websiteSchema,
} from '@/lib/structured-data';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'OSForms: Open-Source Form Backend for HTML & React Forms',
    template: '%s | OSForms',
  },
  description:
    'Free your forms from proprietary clouds. OSForms is the high-performance form backend where you bring your own API keys. Own your data, no lock-in.',
  keywords: [
    'form backend',
    'open source forms',
    'react form backend',
    'nextjs forms',
    'headless forms',
    'form automation',
    'BYOK forms',
    'self-hostable forms',
    'developer tools',
  ],
  authors: [{ name: 'OSForms' }],
  creator: 'OSForms',
  publisher: 'OSForms',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    types: {
      'application/rss+xml': `${SITE_URL}/feed.xml`,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: 'OSForms - Open Source Form Backend',
    description:
      'The open-source form backend for developers. Bring your own API keys, stay in control. Send submissions to Resend, Google Sheets, and webhooks.',
    siteName: 'OSForms',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'OSForms - Open Source Form Backend',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OSForms | Own your form backend',
    description:
      'The open-source form backend for developers. Bring your own API keys, stay in control. 100 free submissions/month, zero lock-in.',
    images: [`${SITE_URL}/og-image.png`],
    creator: '@osforms',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                organizationSchema(),
                websiteSchema(),
                {
                  '@type': 'WebApplication',
                  name: 'OSForms',
                  description:
                    'Open-source form backend for developers. Bring your own API keys and send submissions to Resend, Google Sheets, and webhooks. 100 free submissions/month.',
                  url: SITE_URL,
                  applicationCategory: 'DeveloperApplication',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                    description: '100 free submissions per month',
                  },
                  operatingSystem: 'Web',
                  permissions: 'browser',
                  publisher: { '@id': ORGANIZATION_ID },
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
