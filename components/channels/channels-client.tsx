'use client';

import { useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
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
import { createChannel } from '@/lib/actions/channels';
import { toast } from 'sonner';
import type { Channel } from '@/lib/types/database';

const STATUS_OPTIONS = [
  { value: 'testing', label: 'Testing' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'scaling', label: 'Scaling' },
];

export function ChannelsClient({
  channels,
  autoOpenCreate,
}: {
  channels: Channel[];
  autoOpenCreate?: boolean;
}) {
  const [open, setOpen] = useState(autoOpenCreate ?? false);
  const [status, setStatus] = useState('testing');
  const [isPending, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createChannel(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success('Channel created');
        setOpen(false);
      }
    });
  }

  return (
    <div>
      <PageHeader title="Channels" description="Manage your content channels and brand identities.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className={buttonVariants({ className: 'bg-gradient-to-r from-violet-600 to-cyan-500' })}>
            <Plus className="h-4 w-4 mr-1" />
            New Channel
          </DialogTrigger>
          <DialogContent className="glass-card max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Channel</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" required placeholder="My Tech Channel" />
              </div>
              <div className="space-y-2">
                <Label>Niche</Label>
                <Input name="niche" placeholder="AI & Developer Tools" />
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Textarea name="target_audience" placeholder="Developers, indie hackers..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Input name="language" defaultValue="en" />
                </div>
                <div className="space-y-2">
                  <Label>Platforms (comma-separated)</Label>
                  <Input name="platforms" placeholder="youtube,tiktok,blog" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Brand Style</Label>
                <Input name="brand_style" placeholder="Professional, cinematic" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Posting Frequency</Label>
                  <Input name="posting_frequency" placeholder="3x/week" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <FormSelect
                    name="status"
                    value={status}
                    onValueChange={setStatus}
                    options={STATUS_OPTIONS}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Monetization Goal</Label>
                <Input name="monetization_goal" placeholder="AdSense + affiliate" />
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Creating...' : 'Create Channel'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {channels.length === 0 ? (
        <EmptyState
          title="No channels yet"
          description="Create your first channel to organize content by niche, platform, and brand style."
          actionLabel="Create Channel"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <Card key={channel.id} className="glass-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{channel.name}</CardTitle>
                  <Badge variant="outline">{channel.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {channel.niche && <p><span className="text-muted-foreground">Niche:</span> {channel.niche}</p>}
                {channel.target_audience && <p className="text-muted-foreground line-clamp-2">{channel.target_audience}</p>}
                <div className="flex flex-wrap gap-1 pt-2">
                  {((channel.platforms as string[] | null) ?? []).map((p) => (
                    <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
