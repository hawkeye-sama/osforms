import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

// API Catalog (RFC 9727) — served at /.well-known/api-catalog via a rewrite.
// Points agents at the public API's docs without scraping.
export function GET() {
  const linkset = {
    linkset: [
      {
        anchor: `${SITE_URL}/api/v1`,
        'service-doc': [{ href: `${SITE_URL}/docs`, title: 'OSForms Docs' }],
        'service-desc': [
          {
            href: `${SITE_URL}/docs/api-reference/submit-form`,
            title: 'API Reference',
          },
        ],
        status: [{ href: SITE_URL, title: 'OSForms' }],
      },
    ],
  };

  return new Response(JSON.stringify(linkset, null, 2), {
    headers: {
      'Content-Type': 'application/linkset+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
