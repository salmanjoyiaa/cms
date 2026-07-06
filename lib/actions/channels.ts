'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getUserWorkspace } from '@/lib/supabase/server';
import { logAudit } from '@/lib/audit';
import type { Channel, ChannelStatus } from '@/lib/types/database';

export async function listChannels(): Promise<Channel[]> {
  const ctx = await getUserWorkspace();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('channels')
    .select('*')
    .eq('workspace_id', ctx.workspaceId)
    .order('created_at', { ascending: false });

  return (data ?? []) as Channel[];
}

export async function createChannel(formData: FormData) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const platforms = (formData.get('platforms') as string)?.split(',').filter(Boolean) ?? [];

  const { data, error } = await supabase
    .from('channels')
    .insert({
      workspace_id: ctx.workspaceId,
      name: formData.get('name') as string,
      niche: formData.get('niche') as string,
      target_audience: formData.get('target_audience') as string,
      language: (formData.get('language') as string) || 'en',
      platforms,
      brand_style: formData.get('brand_style') as string,
      posting_frequency: formData.get('posting_frequency') as string,
      monetization_goal: formData.get('monetization_goal') as string,
      status: (formData.get('status') as ChannelStatus) || 'testing',
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await logAudit({
    workspaceId: ctx.workspaceId,
    userId: ctx.user.id,
    action: 'content_create',
    entityType: 'channel',
    entityId: data.id,
  });

  revalidatePath('/dashboard/channels');
  return { success: true, data };
}

export async function updateChannel(id: string, formData: FormData) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const platforms = (formData.get('platforms') as string)?.split(',').filter(Boolean) ?? [];

  const { error } = await supabase
    .from('channels')
    .update({
      name: formData.get('name') as string,
      niche: formData.get('niche') as string,
      target_audience: formData.get('target_audience') as string,
      language: formData.get('language') as string,
      platforms,
      brand_style: formData.get('brand_style') as string,
      posting_frequency: formData.get('posting_frequency') as string,
      monetization_goal: formData.get('monetization_goal') as string,
      status: formData.get('status') as ChannelStatus,
    })
    .eq('id', id)
    .eq('workspace_id', ctx.workspaceId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/channels');
  return { success: true };
}

export async function archiveChannel(id: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('channels')
    .update({ status: 'paused' })
    .eq('id', id)
    .eq('workspace_id', ctx.workspaceId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/channels');
  return { success: true };
}
