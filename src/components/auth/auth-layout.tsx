'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import * as React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="dark bg-background text-foreground relative min-h-screen w-full">
      {/* Grid background with radial glow */}
      <div className="bg-grid-glow fixed inset-0" />

      {/* Content container */}
      <div className="relative flex min-h-screen flex-col">
        {/* Logo header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container mx-auto px-4 py-8"
        >
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xl font-bold transition-opacity hover:opacity-80"
          >
            <span>FreeForms</span>
          </Link>
        </motion.header>

        {/* Main content */}
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="container mx-auto px-4 py-8"
        >
          <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
            <p>
              &copy; {new Date().getFullYear()} FreeForms. Open source form
              backend.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="https://github.com/yourusername/freeforms"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </Link>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
