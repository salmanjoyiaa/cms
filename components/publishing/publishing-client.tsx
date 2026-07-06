'use client';

import { useTransition } from 'react';
import { RefreshCw, Download, X } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { retryPublish, cancelScheduled } from '@/lib/actions/publishing';
import { toast } from 'sonner';
import type { PublishQueueItem } from '@/lib/types/database';

export function PublishingClient({ queue }: { queue: PublishQueueItem[] }) {
  const [isPending, startTransition] = useTransition();

  const handleRetry = (id: string) => {
    startTransition(async () => {
      const result = await retryPublish(id);
      if (result.error) toast.error(result.error);
      else toast.success('Publish attempted');
    });
  };

  const handleCancel = (id: string) => {
    startTransition(async () => {
      await cancelScheduled(id);
      toast.success('Schedule cancelled');
    });
  };

  return (
    <div>
      <PageHeader
        title="Publishing Queue"
        description="Schedule and manage content publishing. Auto-publish only when approved and mode is set to auto."
      />

      {queue.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
          No items in the publishing queue. Add content from a project&apos;s publish tab.
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {(item.content_projects as { title?: string })?.title ?? '—'}
                  </TableCell>
                  <TableCell><Badge variant="outline">{item.platform}</Badge></TableCell>
                  <TableCell>{item.publish_mode}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'failed' ? 'destructive' : 'secondary'}>
                      {item.status}
                    </Badge>
                    {item.error_message && (
                      <p className="text-xs text-destructive mt-1 max-w-xs">{item.error_message}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.scheduled_at ? new Date(item.scheduled_at).toLocaleString() : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.status === 'failed' && (
                        <Button size="sm" variant="outline" onClick={() => handleRetry(item.id)} disabled={isPending}>
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                      {item.status === 'scheduled' && (
                        <Button size="sm" variant="ghost" onClick={() => handleCancel(item.id)} disabled={isPending}>
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" title="Export metadata (placeholder)">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
