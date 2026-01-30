'use client';

import { Check, X } from 'lucide-react';

import { AnimatedSection } from './animated-section';

const FEATURES = [
  'Email notifications',
  'Google Sheets sync',
  'Custom webhooks',
  'Spam protection',
  'Self-hostable',
  'Open source',
];

export function Comparison() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
      {/* Others */}
      <AnimatedSection delay={0}>
        <div className="border-border/30 bg-card/50 rounded-xl border p-6 opacity-60">
          <h3 className="text-muted-foreground mb-6 text-lg font-semibold">
            Other Form Backends
          </h3>
          <ul className="space-y-4">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{f}</span>
                <span className="text-muted-foreground/50 flex items-center gap-1.5">
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
        <div className="border-foreground/20 bg-card relative rounded-xl border-2 p-6">
          <div className="bg-foreground text-background absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-semibold">
            Free
          </div>
          <h3 className="mb-6 text-lg font-semibold">FreeForms</h3>
          <ul className="space-y-4">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center justify-between text-sm">
                <span>{f}</span>
                <span className="text-foreground flex items-center gap-1.5">
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
