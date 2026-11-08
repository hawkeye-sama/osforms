import type { Metadata } from 'next';

import { CursorGridGlow } from '@/components/blog/cursor-grid-glow';
import { Footer } from '@/components/layout/footer';
import { LandingNavbar } from '@/components/layout/landing-navbar';

// No title template here: a template only applies to child segments, and
// /blog has none (posts live at root paths), so the root "%s | OSForms" wins.
export const metadata: Metadata = {
  openGraph: { type: 'website' },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark bg-background text-foreground relative min-h-screen">
      <div className="bg-grid-glow pointer-events-none fixed inset-0" />
      <CursorGridGlow />
      <LandingNavbar />
      <main className="relative pt-16">{children}</main>
      <Footer />
    </div>
  );
}
