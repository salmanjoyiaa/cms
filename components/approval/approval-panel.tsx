'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, RefreshCw, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { approveStep, rejectStep } from '@/lib/actions/approvals';
import { toast } from 'sonner';
import type { ApprovalStep } from '@/lib/types/database';

interface ApprovalPanelProps {
  contentProjectId: string;
  currentStatus: string;
  canApprove: boolean;
  stepLabel: string;
  onRegenerate?: () => Promise<void>;
  onEdit?: () => void;
  approvals?: ApprovalStep[];
}

export function ApprovalPanel({
  contentProjectId,
  currentStatus,
  canApprove,
  stepLabel,
  onRegenerate,
  onEdit,
  approvals = [],
}: ApprovalPanelProps) {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveStep(contentProjectId, notes);
      if (result.error) toast.error(result.error);
      else {
        toast.success(`${stepLabel} approved`);
        setNotes('');
        router.refresh();
      }
    });
  };

  const handleReject = () => {
    if (!notes.trim()) {
      toast.error('Please add rejection notes');
      return;
    }
    startTransition(async () => {
      const result = await rejectStep(contentProjectId, notes);
      if (result.error) toast.error(result.error);
      else {
        toast.success('Rejected with notes');
        setNotes('');
        router.refresh();
      }
    });
  };

  const handleRegenerate = () => {
    if (!onRegenerate) return;
    startTransition(async () => {
      await onRegenerate();
      toast.success('Regenerated — review and approve');
    });
  };

  if (!canApprove) return null;

  return (
    <Card className="glass-card border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Approval Required
          <Badge variant="outline" className="border-amber-500/30 text-amber-400">
            {stepLabel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Add notes (required for rejection)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleApprove}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button onClick={handleReject} disabled={isPending} variant="destructive">
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
          {onRegenerate && (
            <Button onClick={handleRegenerate} disabled={isPending} variant="outline">
              <RefreshCw className="h-4 w-4 mr-1" />
              Regenerate
            </Button>
          )}
          {onEdit && (
            <Button onClick={onEdit} disabled={isPending} variant="outline">
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
        {approvals.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Approval history</p>
            {approvals.slice(0, 5).map((a) => (
              <div key={a.id} className="text-xs flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{a.status}</Badge>
                <span className="text-muted-foreground">{a.step_type}</span>
                {a.approved_at && (
                  <span className="text-muted-foreground">
                    {new Date(a.approved_at).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
