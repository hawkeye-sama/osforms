'use client';

import { motion } from 'motion/react';

const LOGOS = [
  {
    name: 'React',
    icon: (
      <svg
        className="size-6 text-[#61DAFB]"
        viewBox="-11.5 -10.23174 23 20.46348"
        fill="none"
      >
        <circle cx="0" cy="0" r="2.05" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  {
    name: 'Next.js',
    icon: (
      <svg className="size-6 text-white" viewBox="0 0 180 180" fill="none">
        <mask
          id="mask0"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="180"
          height="180"
        >
          <circle cx="90" cy="90" r="90" fill="black" />
        </mask>
        <g mask="url(#mask0)">
          <circle
            cx="90"
            cy="90"
            r="90"
            fill="black"
            stroke="white"
            strokeWidth="6"
          />
          <path
            d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.1836L134.635 157.49C139.728 154.517 144.694 151.191 149.508 147.52V157.52Z"
            fill="white"
          />
          <path d="M115 54H127V125.97H115V54Z" fill="white" />
        </g>
      </svg>
    ),
  },
  {
    name: 'Svelte',
    icon: (
      <svg
        className="size-6 text-[#FF3E00]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M22.25 10.45l-5.75-3.32c-.15-.09-.3-.11-.46-.07-.15.03-.29.13-.37.26l-3.32 5.75c-.09.15-.11.3-.07.46.03.15.13.29.26.37l5.75 3.32c.15.09.3.11.46.07.15-.03.29-.13.37-.26l3.32-5.75c.09-.15.11-.3.07-.46-.03-.15-.13-.29-.26-.37zm-9.32-5.38l-5.75-3.32c-.15-.09-.3-.11-.46-.07-.15.03-.29.13-.37.26L3.03 7.69c-.09.15-.11.3-.07.46.03.15.13.29.26.37l5.75 3.32c.15.09.3.11.46.07.15-.03.29-.13.37-.26l3.32-5.75c.09-.15.11-.3.07-.46-.03-.15-.13-.29-.26-.37z" />
        <path
          d="M11.5 13.55l-5.75-3.32c-.15-.09-.3-.11-.46-.07-.15.03-.29.13-.37.26l-3.32 5.75c-.09.15-.11.3-.07.46.03.15.13.29.26.37l5.75 3.32c.15.09.3.11.46.07.15-.03.29-.13.37-.26l3.32-5.75c.09-.15.11-.3.07-.46-.03-.15-.13-.29-.26-.37z"
          opacity=".5"
        />
      </svg>
    ),
  },
  {
    name: 'Vue',
    icon: (
      <svg className="size-6" viewBox="0 0 256 221" fill="none">
        <path
          d="M204.8 0H256L128 220.8L0 0H51.2L128 132.48L204.8 0Z"
          fill="#41B883"
        />
        <path
          d="M157.44 0H204.8L128 132.48L51.2 0H98.56L128 50.88L157.44 0Z"
          fill="#35495E"
        />
      </svg>
    ),
  },
  {
    name: 'Nuxt',
    icon: (
      <svg className="size-6" viewBox="0 0 256 180" fill="none">
        <path d="M128 36L128 36L128 36L64 144H192L128 36Z" fill="#00DC82" />
        <path d="M128 36L64 144H32L96 36H128Z" fill="#00DC82" opacity="0.6" />
        <path d="M160 90L224 180H256L192 90H160Z" fill="#00DC82" />
      </svg>
    ),
  },
  {
    name: 'Astro',
    icon: (
      <svg
        className="size-6 text-white"
        viewBox="0 0 256 366"
        fill="currentColor"
      >
        <path d="M184.2 0L92.1 160.2L0 319.4H184.2V0Z" />
        <path d="M256 319.4L209.9 239.5L163.8 319.4H256Z" />
        <path d="M184.2 365.2L161.1 319.4H207.3L184.2 365.2Z" />
      </svg>
    ),
  },
];

export function LogoCloud() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className="mt-20 flex flex-col items-center"
    >
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0 },
        }}
        className="text-muted-foreground mb-10 text-xs font-semibold tracking-[0.2em] uppercase"
      >
        Works with your favorite tools
      </motion.p>
      <div className="flex flex-wrap justify-center gap-10 opacity-40 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0 md:gap-16">
        {LOGOS.map((logo, i) => (
          <motion.div
            key={logo.name}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="flex items-center gap-3"
          >
            {logo.icon}
            <span className="text-foreground font-sans text-sm font-medium">
              {logo.name}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
