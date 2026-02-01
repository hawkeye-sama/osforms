'use client';

import Link from 'next/link';

import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="dark bg-background text-foreground relative min-h-screen">
      {/* Background Grid */}
      <div className="bg-grid-glow pointer-events-none fixed inset-0" />

      {/* ─── Header (Mirrored from Landing) ──────────────── */}
      <header className="border-border/40 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            OSForms
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/docs"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="button-glow">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────── */}
      <main className="relative px-8 py-24">
        <div className="mx-auto max-w-180">
          <ScrollReveal>
            <div className="mb-10 flex flex-col items-start gap-4">
              <Badge
                variant="outline"
                className="border-border-strong text-muted-foreground"
              >
                Last updated:{' '}
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Terms of Service
              </h1>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="bg-card/50 border-border-default rounded-xl border p-8 shadow-sm ring-1 ring-white/5 backdrop-blur-sm">
              <div className="prose prose-invert prose-headings:text-foreground prose-headings:font-semibold prose-p:text-muted-foreground prose-li:text-muted-foreground max-w-none">
                <p className="lead text-foreground/90 text-lg">
                  By accessing or using OSForms, you agree to be bound by these
                  Terms of Service. If you do not agree to these terms, please
                  do not use this service.
                </p>

                <h2 className="mt-8 mb-4 text-2xl">
                  1. Description of Service
                </h2>
                <p>
                  OSForms provides a form backend service that allows you to
                  collect form submissions and route them to third-party
                  integrations (such as email or Google Sheets).
                </p>
                <p>
                  <strong>Bring Your Own Keys (BYOK):</strong> OSForms is a BYOK
                  platform. You are responsible for providing valid API keys or
                  credentials for the third-party integrations you wish to use.
                  I do not provide these services myself; I merely facilitate
                  the connection.
                </p>

                <h2 className="mt-8 mb-4 text-2xl">2. User Responsibilities</h2>
                <p>You are responsible for:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    Maintaining the confidentiality of your account credentials.
                  </li>
                  <li>
                    Ensuring that your use of the service complies with all
                    applicable laws and regulations.
                  </li>
                  <li>
                    Complying with the Terms of Service of any third-party
                    platforms you connect to (e.g., Google, Resend).
                  </li>
                  <li>Providing accurate and up-to-date information.</li>
                </ul>

                <h2 className="mt-8 mb-4 text-2xl">3. Intellectual Property</h2>
                <p>
                  OSForms is open-source software. You may use the software in
                  accordance with the MIT License under which it is distributed.
                  However, the OSForms hosted service and brand are proprietary.
                </p>

                <h2 className="mt-8 mb-4 text-2xl">4. Termination</h2>
                <p>
                  I reserve the right to suspend or terminate your account at my
                  sole discretion, without notice, for conduct that I believe
                  violates these Terms of Service or is harmful to other users,
                  me, or third parties, or for any other reason.
                </p>

                <h2 className="mt-8 mb-4 text-2xl">
                  5. Disclaimer of Warranties
                </h2>
                <p>
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
                  AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
                  OR IMPLIED. I DO NOT WARRANT THAT THE SERVICE WILL BE
                  UNINTERRUPTED OR ERROR-FREE.
                </p>

                <h2 className="mt-8 mb-4 text-2xl">
                  6. Limitation of Liability
                </h2>
                <p>
                  IN NO EVENT SHALL OSFORMS BE LIABLE FOR ANY INDIRECT,
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES,
                  ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
                </p>

                <h2 className="mt-8 mb-4 text-2xl">7. Changes to Terms</h2>
                <p>
                  I may modify these Terms of Service at any time. I will
                  provide notice of any significant changes by posting the new
                  Terms on this page. Your continued use of the service after
                  any such changes constitutes your acceptance of the new Terms.
                </p>

                <h2 className="mt-8 mb-4 text-2xl">8. Contact</h2>
                <p>
                  If you have any questions about these Terms, please contact me
                  at{' '}
                  <a
                    href="mailto:jattali12@gmail.com"
                    className="text-foreground hover:underline"
                  >
                    jattali12@gmail.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>

      {/* ─── Footer (Mirrored from Landing) ──────────────── */}
      <footer className="border-border/40 bg-card/20 border-t px-8 py-16 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 sm:grid-cols-4">
          <div>
            <div className="text-base font-semibold">OSForms</div>
            <p className="text-muted-foreground mt-3 text-sm">
              Built by a dev,
              <br />
              for developers.
            </p>
          </div>

          <div>
            <div className="text-foreground mb-3 text-sm font-semibold">
              Product
            </div>
            <nav className="flex flex-col gap-2">
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                GitHub
              </Link>
              <Link
                href="/changelog"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Changelog
              </Link>
            </nav>
          </div>

          <div>
            <div className="text-foreground mb-3 text-sm font-semibold">
              Resources
            </div>
            <nav className="flex flex-col gap-2">
              <Link
                href="/docs"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Docs
              </Link>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/support"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Support
              </Link>
            </nav>
          </div>

          <div>
            <div className="text-foreground mb-3 text-sm font-semibold">
              Legal
            </div>
            <nav className="flex flex-col gap-2">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Terms
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-border/40 mx-auto mt-12 max-w-7xl border-t pt-8 text-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} OSForms. Open source, MIT License.
          </p>
        </div>
      </footer>
    </div>
  );
}
