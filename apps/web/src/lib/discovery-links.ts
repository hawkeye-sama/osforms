/**
 * RFC 8288 Link header values pointing agents at discovery resources.
 * Sent on every route by next.config.ts, and merged into the .md responses
 * from /api/md-render (which also add rel="canonical"). Kept dependency-free
 * so next.config.ts can import it.
 */
export const DISCOVERY_LINKS = [
  '</llms.txt>; rel="alternate"; type="text/plain"; title="llms.txt"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  '</.well-known/api-catalog>; rel="api-catalog"',
].join(', ');
