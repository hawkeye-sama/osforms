import { NextResponse, type NextRequest } from 'next/server';

/**
 * Markdown for Agents — site-wide content negotiation.
 * - `/<path>.md`            → Markdown of that page
 * - `Accept: text/markdown` → Markdown at the canonical URL (Vary: Accept),
 *   while browsers (Accept: text/html) keep getting HTML.
 *
 * Everything is routed to `/api/md-render`, which serves a blog post's source
 * Markdown or converts any other page's HTML.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accept = req.headers.get('accept') || '';

  const wantsMarkdown =
    pathname.endsWith('.md') || accept.includes('text/markdown');
  if (!wantsMarkdown) {
    return NextResponse.next();
  }

  const targetPath = pathname.endsWith('.md')
    ? pathname.slice(0, -3)
    : pathname;
  const url = req.nextUrl.clone();
  url.pathname = '/api/md-render';
  url.search = '';
  url.searchParams.set('path', targetPath || '/');

  const res = NextResponse.rewrite(url);
  res.headers.set('Vary', 'Accept');
  return res;
}

export const config = {
  // Skip Next internals, the API, .well-known, and static asset extensions
  // (so .txt/.xml discovery files and images are untouched). `.md` is allowed.
  matcher: [
    '/((?!api|_next|\\.well-known|.*\\.(?:xml|txt|ico|png|jpg|jpeg|gif|svg|webp|css|js|map|woff2?)$).*)',
  ],
};
