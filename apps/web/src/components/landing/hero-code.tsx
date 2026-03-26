'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CODE = `<form action="https://osforms.com/api/v1/f/abc123" method="POST">
  <input type="text" name="name" placeholder="Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message"></textarea>
  <button type="submit">Send</button>
</form>`;

export function HeroCode() {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(CODE.slice(0, i));
        if (i >= CODE.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, 18);
      return () => clearInterval(interval);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mx-auto w-full max-w-2xl"
    >
      <div className="code-block-dark overflow-hidden rounded-xl shadow-2xl shadow-black/20">
        {/* Window chrome */}
        <div className="border-border/50 flex items-center gap-2 border-b px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-white/10" />
          <div className="h-3 w-3 rounded-full bg-white/10" />
          <div className="h-3 w-3 rounded-full bg-white/10" />
          <span className="text-muted-foreground ml-2 font-mono text-xs">
            index.html
          </span>
        </div>
        {/* Code */}
        <div className="relative min-h-45">
          <SyntaxHighlighter
            language="html"
            style={vscDarkPlus}
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
            {displayed}
          </SyntaxHighlighter>
          {!done && (
            <span className="typing-cursor bg-foreground absolute bottom-5 ml-px inline-block h-3.5 w-0.5" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
