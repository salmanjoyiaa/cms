import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUser } from '@/lib/supabase/server';

export default async function HomePage() {
  const user = await getUser();
  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold gradient-text">ContentMS</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-violet-600 to-cyan-500">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            AI Content Automation{' '}
            <span className="gradient-text">Command Center</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Research viral ideas, generate blog posts and video scripts, manage human approval at every step,
            and publish to multiple platforms — all from one dashboard.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild className="bg-gradient-to-r from-violet-600 to-cyan-500">
              <Link href="/signup">Start building</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/blog">View blog</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
