import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/blog');

export type BlogCategory =
  | 'Build'
  | 'Integrate'
  | 'Ship'
  | 'Compare'
  | 'BYOK Files';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readingTime: string;
  category: BlogCategory;
  content: string;
}

export type BlogPostMeta = Omit<BlogPost, 'content'>;

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '');
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
      const { data } = matter(raw);
      return {
        slug,
        title: data.title as string,
        description: data.description as string,
        date: data.date as string,
        author: (data.author as string) ?? 'osforms Team',
        tags: (data.tags as string[]) ?? [],
        readingTime: (data.readingTime as string) ?? '5 min read',
        category: (data.category as BlogCategory) ?? 'Build',
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    author: (data.author as string) ?? 'osforms Team',
    tags: (data.tags as string[]) ?? [],
    readingTime: (data.readingTime as string) ?? '5 min read',
    category: (data.category as BlogCategory) ?? 'Build',
    content,
  };
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
