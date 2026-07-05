import { getAllPosts, getPostBySlug, postToMarkdown } from '@/lib/blog';
import { SITE_URL } from '@/lib/site';

// Prerender one markdown doc per post at build time.
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(postToMarkdown(post, SITE_URL), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
