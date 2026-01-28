"use client";

import { Check, X } from "lucide-react";
import { AnimatedSection } from "./animated-section";

const FEATURES = [
  "Email notifications",
  "Google Sheets sync",
  "Custom webhooks",
  "Spam protection",
  "Self-hostable",
  "Open source",
];

export function Comparison() {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {/* Others */}
      <AnimatedSection delay={0}>
        <div className="rounded-xl border border-border/30 bg-card/50 p-6 opacity-60">
          <h3 className="text-lg font-semibold text-muted-foreground mb-6">
            Other Form Backends
          </h3>
          <ul className="space-y-4">
            {FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{f}</span>
                <span className="flex items-center gap-1.5 text-muted-foreground/50">
                  <X className="h-4 w-4" />
                  <span className="text-xs">$10+/mo</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </AnimatedSection>

      {/* FreeForms */}
      <AnimatedSection delay={0.15}>
        <div className="rounded-xl border-2 border-foreground/20 bg-card p-6 relative">
          <div className="absolute -top-3 left-6 bg-foreground text-background text-xs font-semibold px-3 py-1 rounded-full">
            Free
          </div>
          <h3 className="text-lg font-semibold mb-6">FreeForms</h3>
          <ul className="space-y-4">
            {FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-center justify-between text-sm"
              >
                <span>{f}</span>
                <span className="flex items-center gap-1.5 text-foreground">
                  <Check className="h-4 w-4" />
                  <span className="text-xs">Included</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </AnimatedSection>
    </div>
  );
}
