'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getUserWorkspace } from '@/lib/supabase/server';
import { logAudit } from '@/lib/audit';
import { canTransition } from '@/lib/content/status-machine';
import type { ContentProject, ContentProjectStatus, PlatformType } from '@/lib/types/database';

export async function listContentProjects(status?: ContentProjectStatus): Promise<(ContentProject & { channels?: { name?: string; niche?: string } | null })[]> {
  const ctx = await getUserWorkspace();
  if (!ctx) return [];

  const supabase = await createClient();
  let query = supabase
    .from('content_projects')
    .select('*, channels(name, niche)')
    .eq('workspace_id', ctx.workspaceId)
    .order('updated_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data } = await query;
  return (data ?? []) as (ContentProject & { channels?: { name?: string; niche?: string } | null })[];
}

export async function getContentProject(id: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('content_projects')
    .select('*, channels(*)')
    .eq('id', id)
    .eq('workspace_id', ctx.workspaceId)
    .single();

  return data;
}

export async function createContentProject(formData: FormData): Promise<
  { error: string; success?: never; data?: never } |
  { success: true; data: ContentProject; error?: never }
> {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content_projects')
    .insert({
      workspace_id: ctx.workspaceId,
      channel_id: (formData.get('channel_id') as string) || null,
      title: formData.get('title') as string,
      topic: formData.get('topic') as string,
      suggested_platform: (formData.get('platform') as PlatformType) || null,
      suggested_language: (formData.get('language') as string) || 'en',
      suggested_format: formData.get('format') as string,
      status: 'idea',
      created_by: ctx.user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await logAudit({
    workspaceId: ctx.workspaceId,
    userId: ctx.user.id,
    action: 'content_create',
    entityType: 'content_project',
    entityId: data.id,
  });

  revalidatePath('/dashboard/content');
  return { success: true, data };
}

export async function updateContentProjectStatus(id: string, newStatus: ContentProjectStatus) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { data: project } = await supabase
    .from('content_projects')
    .select('status')
    .eq('id', id)
    .single();

  if (!project) return { error: 'Project not found' };

  const currentStatus = project.status as ContentProjectStatus;
  if (currentStatus === newStatus) {
    return { success: true };
  }

  if (!canTransition(currentStatus, newStatus)) {
    return { error: `Invalid status transition: ${currentStatus} → ${newStatus}` };
  }

  const { error } = await supabase
    .from('content_projects')
    .update({ status: newStatus })
    .eq('id', id)
    .eq('workspace_id', ctx.workspaceId);

  if (error) return { error: error.message };

  await logAudit({
    workspaceId: ctx.workspaceId,
    userId: ctx.user.id,
    action: 'content_update',
    entityType: 'content_project',
    entityId: id,
    details: { newStatus },
  });

  revalidatePath('/dashboard/content');
  revalidatePath(`/dashboard/content/${id}`);
  return { success: true };
}

export async function updateContentProject(id: string, updates: {
  title?: string;
  topic?: string;
  notes?: string;
}) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('content_projects')
    .update(updates)
    .eq('id', id)
    .eq('workspace_id', ctx.workspaceId);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/content/${id}`);
  return { success: true };
}

export async function getContentStats() {
  const ctx = await getUserWorkspace();
  if (!ctx) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from('content_projects')
    .select('status')
    .eq('workspace_id', ctx.workspaceId);

  const stats: Record<string, number> = {};
  for (const item of data ?? []) {
    stats[item.status] = (stats[item.status] ?? 0) + 1;
  }
  return stats;
}

export async function getPendingApprovals(): Promise<
  Pick<ContentProject, 'id' | 'title' | 'status' | 'updated_at'>[]
> {
  const ctx = await getUserWorkspace();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('content_projects')
    .select('id, title, status, updated_at')
    .eq('workspace_id', ctx.workspaceId)
    .or('status.eq.brief_pending_approval,status.eq.script_pending_approval,status.eq.assets_pending_approval')
    .order('updated_at', { ascending: false })
    .limit(10);

  return (data ?? []) as Pick<ContentProject, 'id' | 'title' | 'status' | 'updated_at'>[];
}
