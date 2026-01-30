'use client';

import { ArrowRight, Github } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/landing/scroll-reveal';

export default function PrivacyPage() {
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
        <div className="mx-auto max-w-[720px]">
          <ScrollReveal>
             <div className="flex flex-col items-start gap-4 mb-10">
                <Badge variant="outline" className="border-border-strong text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Privacy Policy
                </h1>
             </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="bg-card/50 border border-border-default rounded-xl p-8 backdrop-blur-sm shadow-sm ring-1 ring-white/5">
                <div className="prose prose-invert prose-headings:text-foreground prose-headings:font-semibold prose-p:text-muted-foreground prose-li:text-muted-foreground max-w-none">
                  <p className="lead text-lg text-foreground/90">
                    At OSForms, I take your privacy seriously. This Privacy Policy explains how I collect, use, and protect your information when you use my service.
                  </p>

                  <h2 className="text-2xl mt-8 mb-4">1. Information I Collect</h2>
                  <p>
                    I collect information you provide directly when you create an account, configure forms, or set up integrations. This includes:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Account information (email, password)</li>
                    <li>Form configurations and submission data</li>
                    <li>Integration credentials (encrypted API keys)</li>
                  </ul>

                  <h3 className="text-xl mt-6 mb-3">Google User Data</h3>
                  <p>
                    If you choose to connect your Google account for Google Sheets integration, OSForms accesses the following scopes:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>userinfo.email</strong>: To identify your account.</li>
                    <li><strong>userinfo.profile</strong>: To display your name in the dashboard.</li>
                    <li><strong>drive.file</strong>: To create and edit specific Google Sheets files that you designate for form submissions.</li>
                  </ul>

                  <h2 className="text-2xl mt-8 mb-4">2. How I Use Your Information</h2>
                  <p>
                    I use your information to operate and improve OSForms. Specifically:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>To provide the form backend service and route submissions to your configured integrations.</li>
                    <li>To maintain the security of your account and data.</li>
                    <li>To communicate with you about your account and service updates.</li>
                  </ul>

                  <div className="bg-background/50 border border-border-strong rounded-lg p-6 my-8 not-prose">
                    <h4 className="text-foreground font-semibold mt-0 mb-2 flex items-center gap-2">
                      Google API Services User Data Policy
                    </h4>
                    <p className="text-sm text-muted-foreground mb-0 leading-relaxed">
                      OSForms' use and transfer to any other app of information received from Google APIs will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 hover:text-foreground/80">Google API Services User Data Policy</a>, including the Limited Use requirements. I do not use Google user data for advertisements or sell it to third parties.
                    </p>
                  </div>

                  <h2 className="text-2xl mt-8 mb-4">3. Data Security</h2>
                  <p>
                    I implement robust security measures to protect your data. All integration credentials (API keys, tokens) are encrypted at rest using AES-256-GCM encryption. Your credentials are never stored in plain text.
                  </p>

                  <h2 className="text-2xl mt-8 mb-4">4. Data Sharing and Disclosure</h2>
                  <p>
                    I do not sell your personal data. I may share your information only in the following circumstances:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>With your consent or at your direction (e.g., sending form data to your configured third-party integrations like Resend or Google Sheets).</li>
                    <li>To comply with legal obligations or protect my rights.</li>
                  </ul>

                  <h2 className="text-2xl mt-8 mb-4">5. Contact</h2>
                  <p>
                    If you have any questions about this Privacy Policy, please contact me at <a href="mailto:jattali12@gmail.com" className="text-foreground hover:underline">jattali12@gmail.com</a>.
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
