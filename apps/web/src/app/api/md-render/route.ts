import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

import { getPostBySlug, postToMarkdown } from '@/lib/blog';
import { SITE_URL } from '@/lib/site';

// Markdown for Agents: returns a Markdown representation of any page.
// Blog posts serve their source Markdown; every other page is converted from
// its rendered HTML. Reached via middleware on `.md` or `Accept: text/markdown`.
export const dynamic = 'force-dynamic';

// ~4 chars per token is a good-enough estimate for the token-count hints.
const estTokens = (s: string) => Math.ceil(s.length / 4);

function mdResponse(md: string, originalTokens?: number) {
  const headers: Record<string, string> = {
    'Content-Type': 'text/markdown; charset=utf-8',
    Vary: 'Accept',
    'Content-Signal': 'search=yes, ai-input=yes, ai-train=yes',
    'x-markdown-tokens': String(estTokens(md)),
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
  };
  if (originalTokens !== undefined) {
    headers['x-original-tokens'] = String(originalTokens);
  }
  return new Response(md, { headers });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '/';

  // 1) Blog post → serve its source Markdown (highest fidelity).
  const seg = path.replace(/^\/+/, '').replace(/\/+$/, '');
  if (seg && !seg.includes('/')) {
    const post = getPostBySlug(seg);
    if (post) {
      return mdResponse(postToMarkdown(post, SITE_URL));
    }
  }

  // 2) Any other page → fetch its HTML and convert to Markdown.
  let html: string;
  try {
    const res = await fetch(`${url.origin}${path}`, {
      headers: { accept: 'text/html' },
    });
    if (!res.ok) {
      return new Response('Not found', { status: 404 });
    }
    html = await res.text();
  } catch {
    return new Response('Not found', { status: 404 });
  }

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : html;

  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });
  td.use(gfm);
  td.remove([
    'script',
    'style',
    'noscript',
    'nav',
    'footer',
    'header',
    'form',
    'button',
  ]);

  const md = td.turndown(body).trim();
  return mdResponse(md || `# ${path}\n\n${SITE_URL}${path}`, estTokens(html));
}
