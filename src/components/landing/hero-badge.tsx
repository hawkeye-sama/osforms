"use client";

import { motion } from "motion/react";

export function HeroBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center rounded-full border border-border/50 px-4 py-1.5 text-sm font-medium text-muted-foreground"
    >
      <span className="relative mr-2 flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground/70" />
      </span>
      Open Source Form Backend
    </motion.div>
  );
}
