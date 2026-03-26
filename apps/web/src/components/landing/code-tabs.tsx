'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { CopyButton } from './copy-button';

// Colorful syntax highlighting theme
const colorfulDark = {
  'code[class*="language-"]': {
    color: '#e2e8f0',
    background: 'transparent',
    fontFamily: 'var(--font-mono), monospace',
    fontSize: '0.875rem',
    lineHeight: '1.6',
  },
  'pre[class*="language-"]': {
    color: '#e2e8f0',
    background: 'transparent',
    margin: 0,
    padding: 0,
  },
  comment: {
    color: '#64748b',
    fontStyle: 'italic',
  },
  punctuation: {
    color: '#94a3b8',
  },
  property: {
    color: '#38bdf8', // cyan
  },
  tag: {
    color: '#f472b6', // pink
    fontWeight: '600',
  },
  boolean: {
    color: '#fbbf24', // amber
  },
  number: {
    color: '#fbbf24',
  },
  constant: {
    color: '#fbbf24',
  },
  symbol: {
    color: '#fbbf24',
  },
  'attr-name': {
    color: '#a3e635', // lime
  },
  string: {
    color: '#a3e635',
  },
  char: {
    color: '#a3e635',
  },
  builtin: {
    color: '#38bdf8',
  },
  operator: {
    color: '#94a3b8',
  },
  keyword: {
    color: '#818cf8', // indigo
    fontWeight: '600',
  },
  function: {
    color: '#fb923c', // orange
  },
  'class-name': {
    color: '#22d3ee', // cyan
  },
};

const HTML_CODE = `<form
  action="https://osforms.com/api/v1/f/your-slug"
  method="POST"
>
  <input type="text" name="name" placeholder="Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Your message"></textarea>
  <button type="submit">Send</button>
</form>`;

const REACT_CODE = `export function ContactForm() {
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    await fetch("https://osforms.com/api/v1/f/your-slug", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <textarea name="message" placeholder="Your message" />
      <button type="submit">Send</button>
    </form>
  );
}`;

const TABS = [
  { label: 'HTML', file: 'index.html', code: HTML_CODE, lang: 'html' },
  { label: 'React', file: 'ContactForm.tsx', code: REACT_CODE, lang: 'tsx' },
];

export function CodeTabs() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="code-block-dark overflow-hidden rounded-xl shadow-2xl shadow-black/20">
        {/* Tab bar + window chrome */}
        <div className="border-border/50 flex items-center border-b">
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-white/10" />
            <div className="h-3 w-3 rounded-full bg-white/10" />
            <div className="h-3 w-3 rounded-full bg-white/10" />
          </div>
          <div className="-mb-px flex">
            {TABS.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setActive(i)}
                className={`relative z-10 border-b-2 px-4 py-3 font-mono text-xs transition-colors ${
                  i === active
                    ? 'text-foreground border-foreground'
                    : 'text-muted-foreground hover:text-foreground/70 border-transparent'
                }`}
              >
                {t.file}
              </button>
            ))}
          </div>
          <div className="ml-auto pr-3">
            <CopyButton text={tab.code} />
          </div>
        </div>
        {/* Code content */}
        <div className="relative min-h-70">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SyntaxHighlighter
                language={tab.lang}
                style={colorfulDark}
                customStyle={{
                  margin: 0,
                  padding: '1.25rem',
                  background: 'transparent',
                  fontSize: '0.875rem',
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'var(--font-mono), monospace',
                  },
                }}
              >
                {tab.code}
              </SyntaxHighlighter>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
