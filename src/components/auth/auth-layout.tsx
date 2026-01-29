"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="dark relative min-h-screen w-full bg-background text-foreground">
      {/* Grid background with radial glow */}
      <div className="fixed inset-0 bg-grid-glow" />

      {/* Content container */}
      <div className="relative flex min-h-screen flex-col">
        {/* Logo header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container mx-auto px-4 py-8"
        >
          <Link href="/" className="inline-flex items-center space-x-2 text-xl font-bold hover:opacity-80 transition-opacity">
            <span>FreeForms</span>
          </Link>
        </motion.header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} FreeForms. Open source form backend.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="https://github.com/yourusername/freeforms" className="hover:text-foreground transition-colors">
                GitHub
              </Link>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
