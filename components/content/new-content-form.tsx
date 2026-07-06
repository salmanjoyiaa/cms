'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormSelect } from '@/components/ui/form-select';
import { createContentProject } from '@/lib/actions/content';
import { toast } from 'sonner';
import type { Channel } from '@/lib/types/database';

const PLATFORM_OPTIONS = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'blog', label: 'Blog' },
  { value: 'linkedin', label: 'LinkedIn' },
];

export function NewContentForm({
  channels,
  defaultTopic,
}: {
  channels: Channel[];
  defaultTopic?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [channelId, setChannelId] = useState('');
  const [platform, setPlatform] = useState('youtube');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createContentProject(formData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        toast.success('Project created');
        router.push(`/dashboard/content/${result.data.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input name="title" required placeholder="10 AI Tools Every Developer Needs" />
      </div>
      <div className="space-y-2">
        <Label>Topic</Label>
        <Textarea
          name="topic"
          defaultValue={defaultTopic}
          placeholder="Describe the content topic in detail..."
        />
      </div>
      <div className="space-y-2">
        <Label>Channel</Label>
        <FormSelect
          name="channel_id"
          value={channelId}
          onValueChange={setChannelId}
          placeholder="Select channel (optional)"
          options={channels.map((ch) => ({ value: ch.id, label: ch.name }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Platform</Label>
          <FormSelect
            name="platform"
            value={platform}
            onValueChange={setPlatform}
            options={PLATFORM_OPTIONS}
          />
        </div>
        <div className="space-y-2">
          <Label>Language</Label>
          <Input name="language" defaultValue="en" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Format</Label>
        <Input name="format" placeholder="short-form video, long-form article..." />
      </div>
      <Button type="submit" disabled={isPending} className="bg-gradient-to-r from-violet-600 to-cyan-500">
        {isPending ? 'Creating...' : 'Create Project'}
      </Button>
    </form>
  );
}
