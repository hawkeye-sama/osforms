import { NextResponse, type NextRequest } from 'next/server';

/**
 * Markdown content negotiation for AI agents / LLM ingestion.
 * - `/<slug>.md`            → clean Markdown of that blog post
 * - `Accept: text/markdown` → same, at the canonical `/<slug>` URL (Vary: Accept)
 *
 * Both rewrite to the prerendered `/api/md/<slug>` route. Non-post slugs 404 there.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /<slug>.md  → markdown
  if (pathname.endsWith('.md')) {
    const slug = pathname.slice(1, -3);
    if (slug && !slug.includes('/')) {
      const url = req.nextUrl.clone();
      url.pathname = `/api/md/${slug}`;
      return NextResponse.rewrite(url);
    }
  }

  // Accept: text/markdown on a root-level slug → markdown at the same URL
  const accept = req.headers.get('accept') || '';
  if (accept.includes('text/markdown')) {
    const slug = pathname.slice(1);
    if (slug && !slug.includes('/') && !slug.includes('.')) {
      const url = req.nextUrl.clone();
      url.pathname = `/api/md/${slug}`;
      const res = NextResponse.rewrite(url);
      res.headers.set('Vary', 'Accept');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, the API, .well-known, and static asset/file extensions
  // (so .txt/.xml discovery files and images are untouched). `.md` is NOT excluded.
  matcher: [
    '/((?!api|_next|\\.well-known|.*\\.(?:xml|txt|ico|png|jpg|jpeg|gif|svg|webp|css|js|map|woff2?)$).*)',
  ],
};
