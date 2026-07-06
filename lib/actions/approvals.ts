'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getUserWorkspace } from '@/lib/supabase/server';
import { logAudit } from '@/lib/audit';
import {
  APPROVAL_STATUS_MAP,
  POST_APPROVAL_STATUS_MAP,
  REJECTION_STATUS_MAP,
} from '@/lib/content/status-machine';
import type { ApprovalStepType, ContentProjectStatus } from '@/lib/types/database';

const STEP_TYPE_MAP: Partial<Record<ContentProjectStatus, ApprovalStepType>> = {
  brief_pending_approval: 'brief',
  script_pending_approval: 'script',
  assets_pending_approval: 'assets',
};

export async function getApprovalSteps(contentProjectId: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('approval_steps')
    .select('*')
    .eq('content_project_id', contentProjectId)
    .order('created_at', { ascending: false });

  return data ?? [];
}

export async function approveStep(contentProjectId: string, notes?: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { data: project } = await supabase
    .from('content_projects')
    .select('status')
    .eq('id', contentProjectId)
    .single();

  if (!project) return { error: 'Project not found' };

  const currentStatus = project.status as ContentProjectStatus;
  const stepType = STEP_TYPE_MAP[currentStatus];
  let nextStatus = APPROVAL_STATUS_MAP[currentStatus];

  if (!stepType || !nextStatus) return { error: 'Nothing to approve at this stage' };

  const { error: insertError } = await supabase.from('approval_steps').insert({
    content_project_id: contentProjectId,
    workspace_id: ctx.workspaceId,
    step_type: stepType,
    status: 'approved',
    notes: notes ?? null,
    approved_by: ctx.user.id,
    approved_at: new Date().toISOString(),
  });

  if (insertError) return { error: insertError.message };

  const { error: updateError } = await supabase
    .from('content_projects')
    .update({ status: nextStatus })
    .eq('id', contentProjectId);

  if (updateError) return { error: updateError.message };

  const followUpStatus = POST_APPROVAL_STATUS_MAP[nextStatus];
  if (followUpStatus) {
    await supabase
      .from('content_projects')
      .update({ status: followUpStatus })
      .eq('id', contentProjectId);
    nextStatus = followUpStatus;
  }

  await logAudit({
    workspaceId: ctx.workspaceId,
    userId: ctx.user.id,
    action: 'approval',
    entityType: 'content_project',
    entityId: contentProjectId,
    details: { stepType, notes, nextStatus },
  });

  revalidatePath(`/dashboard/content/${contentProjectId}`);
  revalidatePath('/dashboard/content');
  revalidatePath('/dashboard');
  return { success: true, nextStatus };
}

export async function rejectStep(contentProjectId: string, notes: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { data: project } = await supabase
    .from('content_projects')
    .select('status')
    .eq('id', contentProjectId)
    .single();

  const currentStatus = project?.status as ContentProjectStatus;
  const stepType = STEP_TYPE_MAP[currentStatus];
  const rejectStatus = REJECTION_STATUS_MAP[currentStatus];

  if (!stepType || !rejectStatus) return { error: 'Nothing to reject at this stage' };

  const { error: insertError } = await supabase.from('approval_steps').insert({
    content_project_id: contentProjectId,
    workspace_id: ctx.workspaceId,
    step_type: stepType,
    status: 'rejected',
    notes,
    approved_by: ctx.user.id,
    approved_at: new Date().toISOString(),
  });

  if (insertError) return { error: insertError.message };

  const { error: updateError } = await supabase
    .from('content_projects')
    .update({ status: rejectStatus })
    .eq('id', contentProjectId);

  if (updateError) return { error: updateError.message };

  await logAudit({
    workspaceId: ctx.workspaceId,
    userId: ctx.user.id,
    action: 'rejection',
    entityType: 'content_project',
    entityId: contentProjectId,
    details: { stepType, notes, rejectStatus },
  });

  revalidatePath(`/dashboard/content/${contentProjectId}`);
  revalidatePath('/dashboard/content');
  return { success: true };
}

export async function recordRegeneration(contentProjectId: string, stepType: ApprovalStepType) {
  const ctx = await getUserWorkspace();
  if (!ctx) return;

  const supabase = await createClient();
  await supabase.from('approval_steps').insert({
    content_project_id: contentProjectId,
    workspace_id: ctx.workspaceId,
    step_type: stepType,
    status: 'regenerated',
    approved_by: ctx.user.id,
    approved_at: new Date().toISOString(),
  });

  await logAudit({
    workspaceId: ctx.workspaceId,
    userId: ctx.user.id,
    action: 'regeneration',
    entityType: 'content_project',
    entityId: contentProjectId,
    details: { stepType },
  });
}
