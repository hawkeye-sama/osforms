'use client';

import { useEffect, useRef } from 'react';

/**
 * Decorative spotlight that brightens the background grid dots near the cursor.
 * Purely client-side and pointer-events-none, so it never affects content,
 * clicks, or SEO. Disabled on touch devices and when reduced motion is set.
 */
export function CursorGridGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    if (
      !window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let raf = 0;
    let x = 0;
    let y = 0;
    const render = () => {
      raf = 0;
      el.style.setProperty('--gx', `${x}px`);
      el.style.setProperty('--gy', `${y}px`);
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.style.opacity = '1';
      if (!raf) {
        raf = requestAnimationFrame(render);
      }
    };
    const onLeave = () => {
      el.style.opacity = '0';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="cursor-grid-glow pointer-events-none fixed inset-0 z-0"
    />
  );
}
