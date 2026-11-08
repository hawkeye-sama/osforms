'use client';

import {
  ArrowRight,
  Code2,
  Database,
  Github,
  Plug,
  Shield,
  Sparkles,
  Unlock,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { AnimatedIntegrationFlow } from '@/components/landing/animated-integration-flow';
import { CodeTabs } from '@/components/landing/code-tabs';
import { HOME_FAQ } from '@/components/landing/faq-items';
import { FlickeringGrid } from '@/components/landing/flickering-grid';
import { LogoCloud } from '@/components/landing/logo-cloud';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Footer } from '@/components/layout/footer';
import { LandingNavbar } from '@/components/layout/landing-navbar';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

export interface LandingBlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  /** Pre-formatted on the server so this client component never imports the fs-backed blog loader. */
  dateLabel: string;
}

interface LandingPageProps {
  recentPosts: LandingBlogPost[];
}

export function LandingPage({ recentPosts }: LandingPageProps) {
  return (
    <div className="dark bg-background text-foreground relative min-h-screen overflow-hidden">
      {/* Background Grid - Refined */}
      <div className="bg-grid-modern pointer-events-none fixed inset-0 opacity-40" />
      <div className="bg-grid-glow pointer-events-none fixed inset-0 opacity-20" />

      <LandingNavbar />

      {/* ─── Hero Section ─────────────────────────────── */}
      <section className="relative px-8 pt-32 pb-24 lg:pt-48">
        <div className="gradient-radial-glow pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="border-border/60 bg-card/40 text-muted-foreground mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span className="font-medium">Open Source • MIT Licensed</span>
          </motion.div>

          {/* Headline + subheading render visible in the SSR HTML (no
              opacity:0 entrance) so LCP doesn't wait for hydration. */}
          <h1 className="text-foreground text-5xl leading-[1.05] font-bold tracking-tight text-balance sm:text-7xl lg:text-8xl">
            Forms for{' '}
            <span className="animate-shimmer bg-linear-to-r from-neutral-500 via-white to-neutral-500 bg-size-[200%_auto] bg-clip-text text-transparent">
              Developers.
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto mt-8 max-w-3xl text-lg leading-relaxed sm:text-xl lg:text-2xl">
            OSForms is the open-source form backend where you bring your own API
            keys. Submissions go to your Resend email, Google Sheets, and
            webhooks. 100 free submissions a month, or self-host it.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              asChild
              className="button-glow h-14 rounded-full px-10 text-base"
            >
              <Link href="/signup">
                Start Building Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-border/60 h-14 rounded-full px-8 text-base backdrop-blur-sm hover:bg-white/5"
            >
              <Link
                href="https://github.com/hawkeye-sama/osforms"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                Star on GitHub
              </Link>
            </Button>
          </motion.div>

          <LogoCloud />
        </div>

        {/* Hero Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="float-slow relative mx-auto mt-24 max-w-3xl px-4 lg:mt-32"
        >
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-white/5 blur-2xl lg:-inset-8" />
          <CodeTabs />
        </motion.div>
      </section>

      {/* ─── How it Works ─────────────────────────────── */}
      <section id="how-it-works" className="relative scroll-mt-20 px-8 py-32">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal className="mb-20 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Simple 3-step setup.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Go from form to inbox in less than 2 minutes.
            </p>
          </ScrollReveal>

          <div className="grid gap-12 lg:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create Endpoint',
                desc: 'Get a unique endpoint URL for your form. No configuration needed.',
              },
              {
                step: '02',
                title: 'Add to Website',
                desc: 'Paste the URL into your <form> action or use our headless API.',
              },
              {
                step: '03',
                title: 'Own Your Data',
                desc: 'Submissions are stored and forwarded using your own API keys.',
              },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 0.1}>
                <div className="relative">
                  <div className="absolute -top-10 -left-4 font-mono text-8xl font-black text-white/10">
                    {item.step}
                  </div>
                  <div className="relative pt-6">
                    <h3 className="text-foreground text-xl font-bold">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground mt-2">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Integrated Flow ──────────────────────────── */}
      <section
        id="integration"
        className="relative scroll-mt-20 overflow-hidden border-t border-white/5 bg-black/20 px-8 py-32"
      >
        <div className="mx-auto max-w-5xl">
          <ScrollReveal className="mb-20 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl">
              One hub. Infinite flows.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Collect data from any source and forward it to your favorite
              tools.
            </p>
          </ScrollReveal>

          <div className="relative mt-20">
            <AnimatedIntegrationFlow />
          </div>
        </div>
      </section>

      {/* Section Separator */}
      <div className="mx-auto max-w-5xl border-b border-white/5" />

      {/* ─── Bento Grid Features ───────────────────────── */}
      <section
        id="features"
        className="relative scroll-mt-20 overflow-hidden px-8 py-32"
      >
        <FlickeringGrid
          squareSize={4}
          gridGap={8}
          flickerChance={0.2}
          maxOpacity={0.2}
          className="opacity-40"
        />

        <div className="relative z-10 mx-auto max-w-5xl">
          <ScrollReveal className="mb-16 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Powerful features, zero bloat.
            </h2>
          </ScrollReveal>

          <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-2">
            {/* Main Feature - Bento */}
            <ScrollReveal className="md:col-span-4 md:row-span-2" delay={0.1}>
              <div className="bento-card flex h-full flex-col justify-between">
                <div>
                  <div className="bg-primary/10 mb-6 flex h-12 w-12 items-center justify-center rounded-xl">
                    <Unlock className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Full Privacy & Sovereignty
                  </h3>
                  <p className="text-muted-foreground mt-4 max-w-md text-lg">
                    OSForms is built on the principle of data ownership. We
                    don&apos;t lock you into a proprietary cloud. Use your own
                    Resend or Google Sheets keys for direct delivery.
                  </p>
                </div>
                <div className="mt-12 flex gap-4">
                  <div className="border-border/50 rounded-lg border bg-white/5 px-4 py-2 font-mono text-sm text-white">
                    MIT Licensed
                  </div>
                  <div className="border-border/50 rounded-lg border bg-white/5 px-4 py-2 font-mono text-sm text-white">
                    Self-Hostable
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Side Feature 1 */}
            <ScrollReveal className="md:col-span-2" delay={0.2}>
              <div className="bento-card h-full">
                <Plug className="text-primary mb-4 h-6 w-6" />
                <h3 className="text-xl font-bold text-white">
                  Infinite Integrations
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Connect any service via custom webhooks with HMAC signatures
                  for security.
                </p>
              </div>
            </ScrollReveal>

            {/* Side Feature 2 */}
            <ScrollReveal className="md:col-span-2" delay={0.3}>
              <div className="bento-card h-full">
                <Code2 className="text-primary mb-4 h-6 w-6" />
                <h3 className="text-xl font-bold text-white">
                  Developer First
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Headless by design. Works with React, Vue, Svelte, or plain
                  HTML.
                </p>
              </div>
            </ScrollReveal>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                icon: Database,
                title: 'No Database Needed',
                desc: "We handle the storage and validation so you don't have to.",
              },
              {
                icon: Shield,
                title: 'Spam Protection',
                desc: 'Honeypot fields, per-form rate limits, and reCAPTCHA, hCaptcha, or Turnstile with your own keys.',
              },
              {
                icon: Zap,
                title: 'Instant Response',
                desc: 'Submissions are saved and acknowledged right away. Integrations run in the background.',
              },
            ].map((feat, i) => (
              <ScrollReveal key={feat.title} delay={0.4 + i * 0.1}>
                <div className="bento-card">
                  <feat.icon className="text-primary/70 mb-4 h-5 w-5" />
                  <h3 className="font-bold text-white">{feat.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {feat.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── From the Blog ────────────────────────────── */}
      {recentPosts.length > 0 && (
        <section
          id="blog"
          className="relative scroll-mt-20 border-t border-white/5 px-8 py-32"
        >
          <div className="mx-auto max-w-5xl">
            <ScrollReveal className="mb-16 text-center">
              <h2 className="text-foreground text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                From the blog.
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Tutorials and guides on handling forms without running a
                backend.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {recentPosts.map((post, i) => (
                <ScrollReveal key={post.slug} delay={0.1 + i * 0.05}>
                  <Link
                    href={`/${post.slug}`}
                    className="group bento-card flex h-full flex-col"
                  >
                    <div className="text-muted-foreground flex items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
                      <span>{post.category}</span>
                      <span className="text-muted-foreground/50">·</span>
                      <time dateTime={post.date}>{post.dateLabel}</time>
                    </div>
                    <h3 className="text-foreground mt-4 text-lg font-bold tracking-tight">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 line-clamp-3 flex-1 text-sm leading-relaxed">
                      {post.description}
                    </p>
                    <span className="text-foreground mt-6 inline-flex items-center gap-1.5 font-mono text-xs">
                      Read
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 font-mono text-sm tracking-wide transition-colors"
              >
                All posts →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ Section ──────────────────────────── */}
      <section id="faq" className="relative scroll-mt-20 px-8 py-32">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal className="mb-16 text-center">
            <h2 className="mb-2 text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl">
              FAQ
            </h2>
            <p className="text-muted-foreground mt-4">
              Everything you need to know about OSForms.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <Accordion items={HOME_FAQ} />
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────── */}
      <section className="relative overflow-hidden px-8 py-32 text-center">
        <div className="bg-grid-subtle absolute inset-0 opacity-20" />
        <div className="gradient-radial-glow pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-2xl">
          <ScrollReveal>
            <h2 className="text-4xl font-bold tracking-tight text-balance text-white sm:text-6xl">
              Ready to own your form backend?
            </h2>
            <p className="text-muted-foreground mx-auto mt-8 max-w-xl text-xl text-balance">
              Join developers building forms without limits. Open source. No
              lock-in.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="button-glow h-14 rounded-full px-10 text-base"
              >
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
