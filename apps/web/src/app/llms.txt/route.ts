import { getAllPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/site';

// Content lives in the repo and only changes at build time.
export const dynamic = 'force-static';

export function GET() {
  const posts = getAllPosts();

  const blog = posts
    .map((p) => `- [${p.title}](${SITE_URL}/${p.slug}): ${p.description}`)
    .join('\n');

  const body = `# OSForms

> OSForms is an open-source, bring-your-own-key (BYOK) form backend for developers. Point your HTML form at an endpoint; OSForms stores each submission and routes it to your own Resend (email), Google Sheets, and webhooks using your own API keys. 100 free submissions/month, every integration included free, and it's self-hostable.

Key facts:
- BYOK: integrations run on your API keys, so they're free (you pay only your provider, e.g. Resend).
- Your keys are encrypted at rest with AES-256-GCM and never sent to the browser.
- Open source and self-hostable against your own MongoDB.
- Accepts application/x-www-form-urlencoded, multipart/form-data, and application/json.
- Spam protection: configurable honeypot field + optional reCAPTCHA, hCaptcha, or Turnstile.

## Product
- [Get Started (free)](${SITE_URL}/signup): Create a form and get an endpoint in two minutes.
- [Documentation](${SITE_URL}/docs): Quickstart, integrations, SDK, and API reference.
- [GitHub](https://github.com/hawkeye-sama/osforms): Source code; audit or self-host.
- [Blog](${SITE_URL}/blog): Tutorials, comparisons, and guides.

## Blog posts
${blog}

## Machine-readable
- Every blog post is available as clean Markdown: append \`.md\` to its URL (e.g. ${SITE_URL}/${posts[0]?.slug ?? 'slug'}.md) or send \`Accept: text/markdown\`.
- Full corpus: [${SITE_URL}/llms-full.txt](${SITE_URL}/llms-full.txt)
- Sitemap: [${SITE_URL}/sitemap.xml](${SITE_URL}/sitemap.xml)
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
