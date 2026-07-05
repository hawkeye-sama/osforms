import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['mongoose', 'googleapis'],
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
    // RFC 8288 Link headers pointing agents at discovery resources, on every route.
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Link',
            value: [
              `<${'/llms.txt'}>; rel="alternate"; type="text/plain"; title="llms.txt"`,
              `<${'/sitemap.xml'}>; rel="sitemap"; type="application/xml"`,
              `<${'/.well-known/api-catalog'}>; rel="api-catalog"`,
            ].join(', '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
