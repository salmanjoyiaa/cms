'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getUserWorkspace } from '@/lib/supabase/server';
import { logAudit } from '@/lib/audit';
import { blogService } from '@/lib/publishing/blog';
import type {
  Asset,
  AnalyticsSnapshot,
  IntegrationCredentialSafe,
  MonetizationSnapshot,
  PlatformType,
  PublishMode,
  PublishQueueItem,
  TrendResearch,
} from '@/lib/types/database';

type CalendarEvent = {
  id: string;
  scheduled_at: string | null;
  platform: PlatformType;
  status: string;
  content_projects: { title: string } | null;
};

export async function listPublishQueue(): Promise<(PublishQueueItem & { content_projects?: { title: string; status: string } | null })[]> {
  const ctx = await getUserWorkspace();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('publish_queue')
    .select('*, content_projects(title, status)')
    .eq('workspace_id', ctx.workspaceId)
    .order('scheduled_at', { ascending: true });

  return (data ?? []) as (PublishQueueItem & { content_projects?: { title: string; status: string } | null })[];
}

export async function addToPublishQueue(formData: FormData) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { data, error } = await supabase.from('publish_queue').insert({
    workspace_id: ctx.workspaceId,
    content_project_id: formData.get('content_project_id') as string,
    platform: formData.get('platform') as PlatformType,
    publish_mode: (formData.get('publish_mode') as PublishMode) || 'manual',
    scheduled_at: (formData.get('scheduled_at') as string) || null,
    status: formData.get('scheduled_at') ? 'scheduled' : 'queued',
  }).select().single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/publishing');
  revalidatePath('/dashboard/calendar');
  return { success: true, data };
}

export async function retryPublish(queueId: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { data: item } = await supabase
    .from('publish_queue')
    .select('*')
    .eq('id', queueId)
    .single();

  if (!item) return { error: 'Queue item not found' };

  await logAudit({
    workspaceId: ctx.workspaceId,
    userId: ctx.user.id,
    action: 'publish_attempt',
    entityType: 'publish_queue',
    entityId: queueId,
  });

  if (item.platform === 'blog') {
    const { data: blogPost } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('content_project_id', item.content_project_id)
      .single();

    if (!blogPost) return { error: 'Blog post not found' };

    const result = await blogService.publishNow({
      blogPostId: blogPost.id,
      slug: blogPost.slug,
    });

    if (!result.success) {
      await supabase.from('publish_queue').update({
        status: 'failed',
        error_message: result.error,
        retry_count: item.retry_count + 1,
      }).eq('id', queueId);
      return { error: result.error };
    }

    await supabase.from('publish_queue').update({
      status: 'published',
      published_at: new Date().toISOString(),
      error_message: null,
    }).eq('id', queueId);

    revalidatePath('/dashboard/publishing');
    return { success: true };
  }

  await supabase.from('publish_queue').update({
    status: 'failed',
    error_message: `${item.platform}: OAuth not connected. Connect in Settings > Integrations.`,
    retry_count: item.retry_count + 1,
  }).eq('id', queueId);

  return { error: 'Platform integration not connected' };
}

export async function cancelScheduled(queueId: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  await supabase.from('publish_queue').update({
    status: 'draft',
    scheduled_at: null,
  }).eq('id', queueId);

  revalidatePath('/dashboard/publishing');
  revalidatePath('/dashboard/calendar');
  return { success: true };
}

export async function publishBlogPost(contentProjectId: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { data: blogPost } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('content_project_id', contentProjectId)
    .single();

  if (!blogPost) return { error: 'Blog post not found' };

  const result = await blogService.publishNow({
    blogPostId: blogPost.id,
    slug: blogPost.slug,
  });

  if (!result.success) return { error: result.error };

  await supabase.from('content_projects').update({ status: 'published' }).eq('id', contentProjectId);

  await logAudit({
    workspaceId: ctx.workspaceId,
    userId: ctx.user.id,
    action: 'publish_success',
    entityType: 'blog_post',
    entityId: blogPost.id,
  });

  revalidatePath(`/dashboard/content/${contentProjectId}`);
  revalidatePath('/blog');
  return { success: true, url: result.platformUrl };
}

export async function listIntegrations(): Promise<IntegrationCredentialSafe[]> {
  const ctx = await getUserWorkspace();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('integration_credentials_safe')
    .select('*')
    .eq('workspace_id', ctx.workspaceId);

  return (data ?? []) as IntegrationCredentialSafe[];
}

export async function listAssets(): Promise<(Asset & { content_projects?: { title: string } | null })[]> {
  const ctx = await getUserWorkspace();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('assets')
    .select('*, content_projects(title)')
    .eq('workspace_id', ctx.workspaceId)
    .order('created_at', { ascending: false });

  return (data ?? []) as (Asset & { content_projects?: { title: string } | null })[];
}

export async function listTrendResearch(): Promise<TrendResearch[]> {
  const ctx = await getUserWorkspace();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('trend_research')
    .select('*')
    .eq('workspace_id', ctx.workspaceId)
    .order('created_at', { ascending: false });

  return (data ?? []) as TrendResearch[];
}

export async function addManualTopic(formData: FormData) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { error } = await supabase.from('trend_research').insert({
    workspace_id: ctx.workspaceId,
    topic: formData.get('topic') as string,
    trend_score: Number(formData.get('trend_score')) || null,
    monetization_score: Number(formData.get('monetization_score')) || null,
    competition_score: Number(formData.get('competition_score')) || null,
    difficulty_score: Number(formData.get('difficulty_score')) || null,
    suggested_platform: (formData.get('platform') as PlatformType) || null,
    suggested_language: (formData.get('language') as string) || 'en',
    suggested_format: formData.get('format') as string,
    source: 'manual',
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard/research');
  return { success: true };
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const ctx = await getUserWorkspace();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('publish_queue')
    .select('id, scheduled_at, platform, status, content_projects(title)')
    .eq('workspace_id', ctx.workspaceId)
    .not('scheduled_at', 'is', null)
    .order('scheduled_at');

  return (data ?? []) as unknown as CalendarEvent[];
}

export async function getAnalyticsSummary(): Promise<AnalyticsSnapshot[]> {
  const ctx = await getUserWorkspace();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('workspace_id', ctx.workspaceId)
    .order('snapshot_date', { ascending: false })
    .limit(30);

  return (data ?? []) as AnalyticsSnapshot[];
}

export async function getMonetizationSummary(): Promise<MonetizationSnapshot[]> {
  const ctx = await getUserWorkspace();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('monetization_snapshots')
    .select('*')
    .eq('workspace_id', ctx.workspaceId)
    .order('snapshot_date', { ascending: false })
    .limit(30);

  return (data ?? []) as MonetizationSnapshot[];
}

export async function updateBrief(contentProjectId: string, updates: Record<string, unknown>) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { data: brief } = await supabase
    .from('content_briefs')
    .select('id')
    .eq('content_project_id', contentProjectId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (!brief) return { error: 'Brief not found' };

  const { error } = await supabase.from('content_briefs').update(updates).eq('id', brief.id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/content/${contentProjectId}`);
  return { success: true };
}

export async function updateScript(contentProjectId: string, updates: Record<string, unknown>) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { data: script } = await supabase
    .from('scripts')
    .select('id')
    .eq('content_project_id', contentProjectId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (!script) return { error: 'Script not found' };

  const { error } = await supabase.from('scripts').update(updates).eq('id', script.id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/content/${contentProjectId}`);
  return { success: true };
}

export async function getContentDetails(contentProjectId: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return null;

  const supabase = await createClient();

  const [project, brief, script, blog, assets, storyboard, approvals] = await Promise.all([
    supabase.from('content_projects').select('*, channels(*)').eq('id', contentProjectId).single(),
    supabase.from('content_briefs').select('*').eq('content_project_id', contentProjectId).order('version', { ascending: false }).limit(1).single(),
    supabase.from('scripts').select('*').eq('content_project_id', contentProjectId).order('version', { ascending: false }).limit(1).single(),
    supabase.from('blog_posts').select('*').eq('content_project_id', contentProjectId).single(),
    supabase.from('assets').select('*').eq('content_project_id', contentProjectId),
    supabase.from('video_storyboards').select('*').eq('content_project_id', contentProjectId).order('version', { ascending: false }).limit(1).single(),
    supabase.from('approval_steps').select('*').eq('content_project_id', contentProjectId).order('created_at', { ascending: false }),
  ]);

  return {
    project: project.data,
    brief: brief.data,
    script: script.data,
    blog: blog.data,
    assets: assets.data ?? [],
    storyboard: storyboard.data,
    approvals: approvals.data ?? [],
  };
}
