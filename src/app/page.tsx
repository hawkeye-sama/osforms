'use client';

import {
  ArrowRight,
  Code2,
  Database,
  Github,
  Mail,
  Zap,
  Plug,
  Shield,
  Sparkles,
  Unlock,
  Webhook,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { Footer } from '@/components/layout/footer';
import { LandingNavbar } from '@/components/layout/landing-navbar';
import { CodeTabs } from '@/components/landing/code-tabs';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { LogoCloud } from '@/components/landing/logo-cloud';
import { FlickeringGrid } from '@/components/landing/flickering-grid';
import { AnimatedIntegrationFlow } from '@/components/landing/animated-integration-flow';
import { Button } from '@/components/ui/button';
import { Accordion } from '@/components/ui/accordion';

export default function LandingPage() {
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

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-foreground text-5xl leading-[1.05] font-bold tracking-tight text-balance sm:text-7xl lg:text-8xl"
          >
            Forms for{' '}
            <span className="animate-shimmer bg-gradient-to-r from-neutral-500 via-white to-neutral-500 bg-[length:200%_auto] bg-clip-text text-transparent">
              Developers.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-muted-foreground mx-auto mt-8 max-w-3xl text-lg leading-relaxed sm:text-xl lg:text-2xl"
          >
            The open-source form backend where you bring your own API keys.
            Store submissions, trigger integrations, and stay in control.
          </motion.p>

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
                href="https://github.com/osforms/osforms"
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
                    don't lock you into a proprietary cloud. Use your own Resend
                    or Google Sheets keys for direct delivery.
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
                desc: 'Enterprise-grade honeypots and validation included for free.',
              },
              {
                icon: Zap,
                title: 'Blazing Fast',
                desc: 'Globally distributed edge functions ensure sub-100ms response times.',
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
            <Accordion
              items={[
                {
                  question: 'Is it actually free?',
                  answer:
                    'Yes! Our cloud version offers 100 submissions per month for free. If you need more, you can upgrade or self-host the entire platform for free.',
                },
                {
                  question: 'How do I use my own Resend key?',
                  answer:
                    'In your dashboard, go to Integrations and paste your Resend API key. All emails will then be sent directly through your account.',
                },
                {
                  question: 'Can I export my data?',
                  answer:
                    'Absolutely. You can export all your submissions to CSV or JSON at any time. No vendor lock-in, ever.',
                },
                {
                  question: 'Do you support file uploads?',
                  answer:
                    "Currently we're building it out, should be live soon.",
                },
              ]}
            />
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
