'use client';

import {
  ArrowRight,
  Code2,
  Github,
  Globe,
  Mail,
  Plug,
  Sparkles,
  Unlock,
  Webhook,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { CodeTabs } from '@/components/landing/code-tabs';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="dark bg-background text-foreground relative min-h-screen overflow-hidden">
      {/* Background Grid */}
      <div className="bg-grid-glow pointer-events-none fixed inset-0" />

      {/* ─── 1. Sticky Navigation ────────────────────────── */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="border-border/40 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-xl"
      >
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
      </motion.header>

      {/* ─── 2. Hero Section ─────────────────────────────── */}
      <section className="relative px-8 pt-32 pb-24">
        {/* Animated gradient background */}
        <div className="gradient-radial-glow pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-225 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="border-border bg-card/50 text-muted-foreground mb-8 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Open Source • MIT Licensed</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-foreground text-5xl leading-[1.1] font-bold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Forms without
            <br />
            <span className="relative inline-block">
              limits.
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="via-foreground absolute right-0 -bottom-2 left-0 h-0.5 origin-left bg-linear-to-r from-transparent to-transparent"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-muted-foreground mx-auto mt-6 max-w-180 text-lg leading-relaxed sm:text-xl"
          >
            The open-source form backend where you bring your own API keys.
            Store submissions, trigger integrations. No vendor lock-in.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" asChild className="glow-hover h-12 px-8">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-border-strong hover:bg-card h-12 px-6"
            >
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-muted-foreground mt-6 text-sm"
          >
            100 free submissions/month • No credit card
          </motion.div>
        </div>

        {/* Hero Code Example with float animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="float-slow relative mx-auto mt-16 max-w-200"
        >
          <div className="to-background pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-transparent via-transparent" />
          <CodeTabs />
        </motion.div>
      </section>

      {/* ─── 3. Stats Banner ─────────────────────────────── */}
      <ScrollReveal>
        <section className="border-border/40 bg-card/20 border-y px-8 py-12 backdrop-blur-sm">
          <div className="mx-auto grid max-w-250 grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { value: 'OSS', label: 'Open Source' },
              { value: '100/mo', label: 'Free Tier' },
              { value: '0%', label: 'Vendor Lock-In' },
              { value: '<5min', label: 'Setup Time' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="font-mono text-3xl font-bold tracking-tight sm:text-4xl">
                  {stat.value}
                </div>
                <div className="text-muted-foreground mt-2 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ─── 4. Features Grid ────────────────────────────── */}
      <section className="relative px-8 py-32">
        <div className="mx-auto max-w-300">
          <ScrollReveal className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-150 text-lg">
              Built for developers who value control, transparency, and speed.
            </p>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Unlock,
                title: 'Zero Vendor Lock-In',
                description:
                  'Your API keys, your data, your control. Export anytime, self-host if you want. No proprietary formats.',
              },
              {
                icon: Plug,
                title: 'All Integrations Free',
                description:
                  'Resend, Google Sheets, webhooks—all included. Competitors charge $15/mo for features you already pay for.',
              },
              {
                icon: Code2,
                title: 'Developer-First API',
                description:
                  'REST API, webhook signatures, CORS control. Built by developers who read docs, not marketing decks.',
              },
            ].map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 0.1}>
                <div className="group border-border-subtle bg-card/50 card-hover h-full rounded-xl border p-8 text-center backdrop-blur-sm">
                  <div className="bg-card/50 border-border-subtle group-hover:border-border-strong mx-auto flex h-14 w-14 items-center justify-center rounded-lg border transition-colors">
                    <feature.icon className="text-foreground h-6 w-6" />
                  </div>
                  <h3 className="text-foreground mt-6 text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. Integrations Showcase ────────────────────── */}
      <section className="border-border/40 bg-gradient-animated border-t px-8 py-24 text-center">
        <div className="mx-auto max-w-300">
          <ScrollReveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Integrations that don&apos;t cost extra
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Connect your own API keys. Pay only your provider&apos;s costs.
            </p>
          </ScrollReveal>

          <div className="mt-12 flex flex-col items-center justify-center gap-6 md:flex-row">
            {[
              {
                icon: Mail,
                name: 'Resend',
                description: 'Email forwarding',
              },
              {
                icon: Globe,
                name: 'Google Sheets',
                description: 'Auto-append rows',
              },
              {
                icon: Webhook,
                name: 'Webhooks',
                description: 'HMAC-signed POST',
              },
            ].map((integration, i) => (
              <ScrollReveal key={integration.name} delay={i * 0.15}>
                <div className="group bg-card/50 border-border-subtle card-hover flex min-w-60 flex-col items-center gap-4 rounded-xl border p-8 backdrop-blur-sm">
                  <div className="bg-background/50 group-hover:bg-background flex h-12 w-12 items-center justify-center rounded-lg transition-colors">
                    <integration.icon className="text-foreground h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-foreground text-lg font-semibold">
                      {integration.name}
                    </div>
                    <div className="text-muted-foreground mt-1 text-sm">
                      {integration.description}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. Pricing Callout ──────────────────────────── */}
      <section className="px-8 py-32">
        <div className="mx-auto max-w-150">
          <ScrollReveal>
            <div className="border-border bg-card/30 glow-hover relative overflow-hidden rounded-2xl border p-12 text-center backdrop-blur-sm">
              <div className="bg-gradient-radial-glow pointer-events-none absolute inset-0" />
              <div className="relative">
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  100 submissions
                </h2>
                <p className="text-muted-foreground mt-2 text-2xl font-medium">
                  Free forever
                </p>
                <p className="text-muted-foreground mt-6 text-base">
                  No credit card required.
                </p>
                <Button size="lg" asChild className="glow-hover mt-8 h-12 px-8">
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 7. Final CTA ────────────────────────────────── */}
      <section className="border-border/40 relative border-t px-8 py-32 text-center">
        <div className="gradient-radial-glow pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-180">
          <ScrollReveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Ready to own your form backend?
            </h2>
            <p className="text-muted-foreground mt-6 text-lg">
              Join developers building forms without limits. Open source. No
              lock-in.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="glow-hover h-12 px-8">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                asChild
                className="hover:bg-card h-12 px-6"
              >
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 8. Footer ───────────────────────────────────── */}
      <footer className="border-border/40 bg-card/20 border-t px-8 py-16 backdrop-blur-sm">
        <div className="mx-auto grid max-w-300 grid-cols-1 gap-12 sm:grid-cols-4">
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

        <div className="border-border/40 mx-auto mt-12 max-w-300 border-t pt-8 text-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} OSForms. Open source, MIT License.
          </p>
        </div>
      </footer>
    </div>
  );
}
