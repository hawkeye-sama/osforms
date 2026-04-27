import type { Metadata } from 'next';

import { Footer } from '@/components/layout/footer';
import { LandingNavbar } from '@/components/layout/landing-navbar';

export const metadata: Metadata = {
  title: {
    default: 'Blog',
    template: '%s | osforms Blog',
  },
  description:
    'Tutorials, guides, and insights on form backends, BYOK integrations, and developer tools from the osforms team.',
  openGraph: { type: 'website' },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark bg-background text-foreground relative min-h-screen">
      <div className="bg-grid-glow pointer-events-none fixed inset-0" />
      <LandingNavbar />
      <main className="relative pt-16">{children}</main>
      <Footer />
    </div>
  );
}
