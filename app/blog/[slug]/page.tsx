import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, meta_title, meta_description, featured_image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) return { title: 'Not Found' };

  return {
    title: post.meta_title ?? post.title,
    description: post.meta_description ?? undefined,
    openGraph: {
      title: post.meta_title ?? post.title,
      description: post.meta_description ?? undefined,
      images: post.featured_image_url ? [post.featured_image_url] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description,
    datePublished: post.published_at,
    author: { '@type': 'Organization', name: 'ContentMS' },
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="border-b border-white/10">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/blog" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold gradient-text">ContentMS Blog</span>
          </Link>
        </div>
      </header>

      <article className="container mx-auto px-6 py-12 max-w-3xl">
        {post.featured_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featured_image_url} alt={post.title} className="w-full rounded-xl mb-8" />
        )}
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex gap-2 mb-8 text-sm text-muted-foreground">
          {post.published_at && <time>{new Date(post.published_at).toLocaleDateString()}</time>}
          {post.category && <span>· {post.category}</span>}
        </div>
        <div className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown>{post.content ?? ''}</ReactMarkdown>
        </div>
        {(post.tags as string[])?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-white/10">
            {(post.tags as string[]).map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-400">
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
