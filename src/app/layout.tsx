import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'OSForms | The Open-Source Form Backend for Modern Devs',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    title: 'OSForms - Open Source Form Backend',
    description:
      'The open-source form backend for developers. Bring your own API keys, stay in control. Integrated with Resend, Google Sheets, and Slack.',
    siteName: 'OSForms',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
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
      'The open-source form backend for developers. Bring your own API keys, stay in control. Unlimited submissions, zero lock-in.',
    images: [`${baseUrl}/og-image.png`],
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
              '@type': 'WebApplication',
              name: 'OSForms',
              description:
                'Open-source form backend for developers. Bring your own API keys, get unlimited power.',
              url: baseUrl,
              applicationCategory: 'DeveloperApplication',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                description: '100 free submissions per month',
              },
              operatingSystem: 'Web',
              permissions: 'browser',
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
