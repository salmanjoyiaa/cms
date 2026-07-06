'use client';

import { useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormSelect } from '@/components/ui/form-select';
import { createPromptTemplate } from '@/lib/actions/prompts';
import { toast } from 'sonner';
import type { PromptTemplate } from '@/lib/types/database';

const CATEGORY_OPTIONS = [
  'research', 'brief', 'script', 'blog', 'caption', 'hashtag', 'image_prompt', 'storyboard', 'voiceover',
].map((c) => ({ value: c, label: c }));

export function PromptsClient({ templates }: { templates: PromptTemplate[] }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createPromptTemplate(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success('Template created');
        setOpen(false);
      }
    });
  }

  return (
    <div>
      <PageHeader title="Prompt Templates" description="Customize AI prompts for each content generation step.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className={buttonVariants({ className: 'bg-gradient-to-r from-violet-600 to-cyan-500' })}>
            <Plus className="h-4 w-4 mr-1" /> New Template
          </DialogTrigger>
          <DialogContent className="glass-card max-w-lg">
            <DialogHeader><DialogTitle>Create Prompt Template</DialogTitle></DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <FormSelect
                  name="category"
                  value={category}
                  onValueChange={setCategory}
                  placeholder="Select category"
                  options={CATEGORY_OPTIONS}
                  required
                />
              </div>
              <div className="space-y-2"><Label>Name</Label><Input name="name" required /></div>
              <div className="space-y-2"><Label>Description</Label><Input name="description" /></div>
              <div className="space-y-2">
                <Label>Template (use {'{{variable}}'} syntax)</Label>
                <Textarea name="template" required rows={6} />
              </div>
              <Button type="submit" disabled={isPending}>Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-4">
        {templates.map((t) => (
          <Card key={t.id} className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{t.name}</CardTitle>
                <Badge variant="outline">{t.category}</Badge>
                {t.is_system && <Badge variant="secondary">System</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{t.description}</p>
              <pre className="text-xs font-mono bg-black/30 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {t.template}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
