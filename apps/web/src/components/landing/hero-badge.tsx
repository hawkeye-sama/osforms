'use client';

import { motion } from 'motion/react';

export function HeroBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-border/50 text-muted-foreground inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium"
    >
      <span className="relative mr-2 flex h-2 w-2">
        <span className="bg-foreground/40 absolute inline-flex h-full w-full animate-ping rounded-full" />
        <span className="bg-foreground/70 relative inline-flex h-2 w-2 rounded-full" />
      </span>
      Open Source Form Backend
    </motion.div>
  );
}
