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
    ];
  },
};

export default nextConfig;
