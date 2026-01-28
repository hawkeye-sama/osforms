"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const CODE = `<form action="https://freeforms.com/api/v1/f/abc123" method="POST">
  <input type="text" name="name" placeholder="Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message"></textarea>
  <button type="submit">Send</button>
</form>`;

export function HeroCode() {
  const [displayed, setDisplayed] = useState("");
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
      className="w-full max-w-2xl mx-auto"
    >
      <div className="rounded-xl code-block-dark overflow-hidden shadow-2xl shadow-black/20">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-white/10" />
          <div className="h-3 w-3 rounded-full bg-white/10" />
          <div className="h-3 w-3 rounded-full bg-white/10" />
          <span className="ml-2 text-xs text-muted-foreground font-mono">
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
              padding: "1.25rem",
              background: "transparent",
              fontSize: "0.875rem",
            }}
            codeTagProps={{
              style: {
                fontFamily: "var(--font-mono), monospace",
              },
            }}
          >
            {displayed}
          </SyntaxHighlighter>
          {!done && (
            <span className="typing-cursor absolute bottom-5 inline-block w-0.5 h-3.5 bg-foreground ml-px" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
