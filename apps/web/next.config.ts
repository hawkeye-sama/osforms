import path from 'path';

import type { NextConfig } from 'next';

import { DISCOVERY_LINKS } from './src/lib/discovery-links';

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Emit a self-contained server build for Docker/self-hosting. The tracing
  // root is the monorepo root so workspace deps (@osforms/react) are included.
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  serverExternalPackages: ['mongoose', 'googleapis'],
  // UTC date (YYYY-MM-DD) this build was made. Inlined at build time; the blog
  // treats posts dated after it as scheduled, and /api/cron/publish compares
  // it with today to decide whether a rebuild is due.
  env: {
    BUILD_DATE: new Date().toISOString().slice(0, 10),
  },
  // Route handlers that read the blog's .mdx files at request time; make sure
  // the content ships with their serverless functions.
  outputFileTracingIncludes: {
    '/api/cron/publish': ['./src/content/blog/**/*'],
    '/api/cron/indexnow': ['./src/content/blog/**/*'],
    '/api/md-render': ['./src/content/blog/**/*'],
  },
  async redirects() {
    return [
      // Blog posts renamed in 3ca0ba6 ("redesign and added SEO Stuff").
      {
        source: '/byok-form-backend-explained',
        destination: '/bring-your-own-key',
        permanent: true,
      },
      {
        source: '/how-to-add-email-notifications-to-html-forms',
        destination: '/form-email-notifications',
        permanent: true,
      },
      // Posts are served at the root; old links used /blog/<slug>. Matches a
      // single segment only, so the /blog index itself is unaffected (app/blog
      // has no child routes).
      {
        source: '/blog/:slug',
        destination: '/:slug',
        permanent: true,
      },
      // Next.js also serves the homepage at /index; GSC flagged it as a
      // duplicate. Collapse it onto the canonical root.
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/docs',
        destination: 'https://osforms.mintlify.dev/docs',
      },
      {
        source: '/docs/:match*',
        destination: 'https://osforms.mintlify.dev/docs/:match*',
      },
      // Agent-readiness discovery endpoints (served by route handlers).
      {
        source: '/.well-known/agent-skills/index.json',
        destination: '/api/well-known/agent-skills',
      },
      {
        source: '/.well-known/api-catalog',
        destination: '/api/well-known/api-catalog',
      },
    ];
  },
  async headers() {
    // RFC 8288 Link headers pointing agents at discovery resources, on every
    // route except `.md` URLs: config headers override a route's own, and
    // /api/md-render sends its own Link (these links + rel="canonical").
    return [
      {
        source: '/:path((?!.*\\.md$).*)',
        headers: [{ key: 'Link', value: DISCOVERY_LINKS }],
      },
    ];
  },
};

export default nextConfig;
