'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { CopyButton } from './copy-button';

// Monotone grayscale syntax highlighting theme
const monotoneDark = {
  'code[class*="language-"]': {
    color: '#FAFAFA',
    background: 'transparent',
    fontFamily: 'var(--font-mono), monospace',
    fontSize: '0.875rem',
    lineHeight: '1.6',
  },
  'pre[class*="language-"]': {
    color: '#FAFAFA',
    background: 'transparent',
    margin: 0,
    padding: 0,
  },
  comment: {
    color: '#737373',
    fontStyle: 'italic',
  },
  prolog: {
    color: '#737373',
  },
  doctype: {
    color: '#737373',
  },
  cdata: {
    color: '#737373',
  },
  punctuation: {
    color: '#B3B3B3',
  },
  property: {
    color: '#FAFAFA',
  },
  tag: {
    color: '#FAFAFA',
    fontWeight: '600',
  },
  boolean: {
    color: '#D4D4D4',
  },
  number: {
    color: '#D4D4D4',
  },
  constant: {
    color: '#D4D4D4',
  },
  symbol: {
    color: '#D4D4D4',
  },
  selector: {
    color: '#FAFAFA',
  },
  'attr-name': {
    color: '#B3B3B3',
  },
  string: {
    color: '#B3B3B3',
  },
  char: {
    color: '#B3B3B3',
  },
  builtin: {
    color: '#FAFAFA',
  },
  operator: {
    color: '#B3B3B3',
  },
  entity: {
    color: '#FAFAFA',
  },
  url: {
    color: '#B3B3B3',
  },
  '.language-css .token.string': {
    color: '#B3B3B3',
  },
  '.style .token.string': {
    color: '#B3B3B3',
  },
  variable: {
    color: '#D4D4D4',
  },
  atrule: {
    color: '#FAFAFA',
  },
  'attr-value': {
    color: '#B3B3B3',
  },
  keyword: {
    color: '#FAFAFA',
    fontWeight: '600',
  },
  function: {
    color: '#FAFAFA',
  },
  'class-name': {
    color: '#FAFAFA',
  },
  regex: {
    color: '#B3B3B3',
  },
  important: {
    color: '#FAFAFA',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
};

const HTML_CODE = `<form
  action="https://freeforms.com/api/v1/f/your-slug"
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

    await fetch("https://freeforms.com/api/v1/f/your-slug", {
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
                className={`border-b-2 px-4 py-3 font-mono text-xs transition-colors ${
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
                style={monotoneDark}
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
