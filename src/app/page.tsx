"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Github,
  Mail,
  Globe,
  Webhook,
  Unlock,
  Plug,
  Code2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeTabs } from "@/components/landing/code-tabs";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export default function LandingPage() {
  return (
    <div className="dark bg-background text-foreground min-h-screen relative overflow-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-grid-glow pointer-events-none" />

      {/* ─── 1. Sticky Navigation ────────────────────────── */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-8">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            FreeForms
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
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
      <section className="relative pt-32 pb-24 px-8">
        {/* Animated gradient background */}
        <div className="absolute inset-0 gradient-radial-glow pointer-events-none" />

        <div className="relative mx-auto max-w-[900px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm text-sm text-muted-foreground mb-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Open Source • MIT Licensed</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-foreground"
          >
            Forms without
            <br />
            <span className="relative inline-block">
              limits.
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-foreground to-transparent origin-left"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-[720px] mx-auto leading-relaxed"
          >
            The open-source form backend where you bring your own API keys.
            Store submissions, trigger integrations. No vendor lock-in.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" asChild className="h-12 px-8 glow-hover">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 px-6 border-border-strong hover:bg-card"
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
            className="mt-6 text-sm text-muted-foreground"
          >
            100 free submissions/month • No credit card
          </motion.div>
        </div>

        {/* Hero Code Example with float animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="relative mx-auto max-w-[800px] mt-16 float-slow"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none z-10" />
          <CodeTabs />
        </motion.div>
      </section>

      {/* ─── 3. Stats Banner ─────────────────────────────── */}
      <ScrollReveal>
        <section className="border-y border-border/40 py-12 px-8 bg-card/20 backdrop-blur-sm">
          <div className="mx-auto max-w-[1000px] grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "OSS", label: "Open Source" },
              { value: "100/mo", label: "Free Tier" },
              { value: "0%", label: "Vendor Lock-In" },
              { value: "<5min", label: "Setup Time" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ─── 4. Features Grid ────────────────────────────── */}
      <section className="py-32 px-8 relative">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need. Nothing you don't.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-[600px] mx-auto">
              Built for developers who value control, transparency, and speed.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Unlock,
                title: "Zero Vendor Lock-In",
                description:
                  "Your API keys, your data, your control. Export anytime, self-host if you want. No proprietary formats.",
              },
              {
                icon: Plug,
                title: "All Integrations Free",
                description:
                  "Resend, Google Sheets, webhooks—all included. Competitors charge $15/mo for features you already pay for.",
              },
              {
                icon: Code2,
                title: "Developer-First API",
                description:
                  "REST API, webhook signatures, CORS control. Built by developers who read docs, not marketing decks.",
              },
            ].map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 0.1}>
                <div className="group h-full rounded-xl border border-border-subtle bg-card/50 backdrop-blur-sm p-8 text-center card-hover">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-card/50 border border-border-subtle group-hover:border-border-strong transition-colors">
                    <feature.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. Integrations Showcase ────────────────────── */}
      <section className="py-24 px-8 text-center border-t border-border/40 bg-gradient-animated">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Integrations that don't cost extra
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Connect your own API keys. Pay only your provider's costs.
            </p>
          </ScrollReveal>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6">
            {[
              {
                icon: Mail,
                name: "Resend",
                description: "Email forwarding",
              },
              {
                icon: Globe,
                name: "Google Sheets",
                description: "Auto-append rows",
              },
              {
                icon: Webhook,
                name: "Webhooks",
                description: "HMAC-signed POST",
              },
            ].map((integration, i) => (
              <ScrollReveal key={integration.name} delay={i * 0.15}>
                <div className="group flex flex-col items-center gap-4 p-8 bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl min-w-[240px] card-hover">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background/50 group-hover:bg-background transition-colors">
                    <integration.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-foreground">
                      {integration.name}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
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
      <section className="py-32 px-8">
        <div className="mx-auto max-w-[600px]">
          <ScrollReveal>
            <div className="relative rounded-2xl border border-border bg-card/30 backdrop-blur-sm p-12 text-center overflow-hidden glow-hover">
              <div className="absolute inset-0 bg-gradient-radial-glow pointer-events-none" />
              <div className="relative">
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  100 submissions
                </h2>
                <p className="mt-2 text-2xl font-medium text-muted-foreground">
                  Free forever
                </p>
                <p className="mt-6 text-base text-muted-foreground">
                  No credit card required. Upgrade to 2,000 for just $9/mo.
                </p>
                <Button size="lg" asChild className="mt-8 h-12 px-8 glow-hover">
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
      <section className="py-32 px-8 text-center border-t border-border/40 relative">
        <div className="absolute inset-0 gradient-radial-glow pointer-events-none" />
        <div className="relative mx-auto max-w-[720px]">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Ready to own your form backend?
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Join developers building forms without limits. Open source. No
              lock-in.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="h-12 px-8 glow-hover">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                asChild
                className="h-12 px-6 hover:bg-card"
              >
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 8. Footer ───────────────────────────────────── */}
      <footer className="border-t border-border/40 py-16 px-8 bg-card/20 backdrop-blur-sm">
        <div className="mx-auto max-w-[1200px] grid grid-cols-1 sm:grid-cols-4 gap-12">
          <div>
            <div className="text-base font-semibold">FreeForms</div>
            <p className="mt-3 text-sm text-muted-foreground">
              Built by developers,
              <br />
              for developers.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-foreground mb-3">
              Product
            </div>
            <nav className="flex flex-col gap-2">
              <Link
                href="/pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </Link>
              <Link
                href="/changelog"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Changelog
              </Link>
            </nav>
          </div>

          <div>
            <div className="text-sm font-semibold text-foreground mb-3">
              Resources
            </div>
            <nav className="flex flex-col gap-2">
              <Link
                href="/docs"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </Link>
              <Link
                href="/blog"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/support"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Support
              </Link>
            </nav>
          </div>

          <div>
            <div className="text-sm font-semibold text-foreground mb-3">
              Legal
            </div>
            <nav className="flex flex-col gap-2">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] mt-12 pt-8 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FreeForms. Open source, MIT License.
          </p>
        </div>
      </footer>
    </div>
  );
}
