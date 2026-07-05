import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

// Custom robots.txt: standard crawl rules + Content Signals (declares how the
// content may be used) + explicit AI-crawler allowances so OSForms is
// discoverable in AI answers and agent tooling.
export function GET() {
  // Curated allow-list of the crawlers that actually drive AI answers/search.
  // We already `Allow: /` for `*`, so this is a signal of intent, not a gate — we
  // deliberately do NOT enumerate the full universe of scrapers (that's a
  // block-list concern). Grouped by operator.
  const aiBots = [
    // OpenAI
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    // Anthropic
    'ClaudeBot',
    'Claude-User',
    'Claude-SearchBot',
    'anthropic-ai',
    'Claude-Web',
    // Google (AI surfaces beyond core Googlebot)
    'Google-Extended',
    'GoogleOther',
    // Perplexity
    'PerplexityBot',
    'Perplexity-User',
    // Apple
    'Applebot-Extended',
    // Amazon
    'Amazonbot',
    // Meta AI
    'meta-externalagent',
    // ByteDance
    'Bytespider',
    // DuckDuckGo AI
    'DuckAssistBot',
    // You.com
    'YouBot',
    // Mistral
    'MistralAI-User',
    // Cohere
    'cohere-ai',
    // Common Crawl (feeds many models/answer engines)
    'CCBot',
  ];

  const body = `# OSForms — https://osforms.com
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /onboarding
Disallow: /verify-email
Content-Signal: search=yes, ai-input=yes, ai-train=yes

# AI crawlers are welcome — we want to be discoverable in AI answers.
${aiBots.map((ua) => `User-agent: ${ua}\nAllow: /`).join('\n\n')}

Host: ${SITE_URL}
Sitemap: ${SITE_URL}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
