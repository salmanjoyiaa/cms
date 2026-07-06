'use client';

import { useState, useTransition } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { runResearch } from '@/lib/actions/ai';
import { addManualTopic } from '@/lib/actions/publishing';
import { toast } from 'sonner';
import Link from 'next/link';
import type { TrendResearch } from '@/lib/types/database';

export function ResearchClient({ topics }: { topics: TrendResearch[] }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [niche, setNiche] = useState('AI & Developer Tools');
  const [audience, setAudience] = useState('Developers and indie hackers');

  const handleResearch = () => {
    startTransition(async () => {
      const result = await runResearch(niche, audience, 'en');
      if (result.error) toast.error(result.error);
      else toast.success(`Found ${result.topics?.length ?? 0} trending topics`);
    });
  };

  const handleManualAdd = (formData: FormData) => {
    startTransition(async () => {
      const result = await addManualTopic(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success('Topic added');
        setOpen(false);
      }
    });
  };

  return (
    <div>
      <PageHeader title="Content Research Board" description="Discover trending topics with AI-powered research and scoring.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className={buttonVariants({ variant: 'outline' })}>
            <Plus className="h-4 w-4 mr-1" /> Add Topic
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader><DialogTitle>Add Topic Manually</DialogTitle></DialogHeader>
            <form action={handleManualAdd} className="space-y-4">
              <div className="space-y-2"><Label>Topic</Label><Input name="topic" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Trend Score</Label><Input name="trend_score" type="number" min="0" max="100" /></div>
                <div className="space-y-2"><Label>Monetization</Label><Input name="monetization_score" type="number" min="0" max="100" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Competition</Label><Input name="competition_score" type="number" min="0" max="100" /></div>
                <div className="space-y-2"><Label>Difficulty</Label><Input name="difficulty_score" type="number" min="0" max="100" /></div>
              </div>
              <div className="space-y-2"><Label>Platform</Label><Input name="platform" placeholder="youtube" /></div>
              <Button type="submit" disabled={isPending}>Add Topic</Button>
            </form>
          </DialogContent>
        </Dialog>
        <Button onClick={handleResearch} disabled={isPending} className="bg-gradient-to-r from-violet-600 to-cyan-500">
          <Sparkles className="h-4 w-4 mr-1" />
          {isPending ? 'Researching...' : 'Research Trends'}
        </Button>
      </PageHeader>

      <Card className="glass-card mb-6">
        <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Niche</Label>
            <Input value={niche} onChange={(e) => setNiche(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Input value={audience} onChange={(e) => setAudience(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {topics.length === 0 ? (
        <Card className="glass-card p-12 text-center text-muted-foreground">
          No research topics yet. Add manually or run AI research.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((topic) => (
            <Card key={topic.id} className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">{topic.topic}</CardTitle>
                <Badge variant="outline">{topic.source}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Trend:</span> {topic.trend_score ?? '—'}</div>
                  <div><span className="text-muted-foreground">Monetization:</span> {topic.monetization_score ?? '—'}</div>
                  <div><span className="text-muted-foreground">Competition:</span> {topic.competition_score ?? '—'}</div>
                  <div><span className="text-muted-foreground">Difficulty:</span> {topic.difficulty_score ?? '—'}</div>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {topic.suggested_platform && <Badge variant="secondary">{topic.suggested_platform}</Badge>}
                  {topic.suggested_format && <Badge variant="secondary">{topic.suggested_format}</Badge>}
                  {topic.suggested_language && <Badge variant="secondary">{topic.suggested_language}</Badge>}
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/content/new?topic=${encodeURIComponent(topic.topic)}`}>
                    Create Content Project
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
