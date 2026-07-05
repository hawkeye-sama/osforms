import { getAllPosts, getPostBySlug, postToMarkdown } from '@/lib/blog';
import { SITE_URL } from '@/lib/site';

// Full markdown corpus for AI ingestion — regenerated at build time.
export const dynamic = 'force-static';

export function GET() {
  const posts = getAllPosts();

  const header = `# OSForms — Full Content

> Open-source, bring-your-own-key form backend for developers. The complete blog corpus in Markdown, for AI ingestion. Index: ${SITE_URL}/llms.txt

---

`;

  const bodies = posts
    .map((meta) => {
      const post = getPostBySlug(meta.slug);
      return post ? postToMarkdown(post, SITE_URL) : '';
    })
    .filter(Boolean)
    .join('\n\n---\n\n');

  return new Response(header + bodies, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
