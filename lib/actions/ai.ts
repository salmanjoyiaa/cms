'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getUserWorkspace } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { encryptCredential } from '@/lib/crypto/credentials';
import { testGroqConnection } from '@/lib/ai/providers/groq';
import { logAudit } from '@/lib/audit';
import {
  generateContentBrief,
  generateScript,
  generateBlogPost,
  generateCaptions,
  generateHashtags,
  researchTopics,
  generateStoryboard,
  generateImagePrompts,
  generateVoiceoverScript,
} from '@/lib/ai';
import { recordRegeneration } from './approvals';
import { updateContentProjectStatus } from './content';
import type { Channel } from '@/lib/types/database';

async function getChannelContext(channelId: string | null) {
  if (!channelId) return undefined;
  const supabase = await createClient();
  const { data } = await supabase.from('channels').select('*').eq('id', channelId).single();
  if (!data) return undefined;
  const ch = data as Channel;
  return {
    name: ch.name,
    niche: ch.niche ?? undefined,
    target_audience: ch.target_audience ?? undefined,
    brand_style: ch.brand_style ?? undefined,
  };
}

export async function generateBrief(contentProjectId: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { data: project } = await supabase
    .from('content_projects')
    .select('*')
    .eq('id', contentProjectId)
    .single();

  if (!project) return { error: 'Project not found' };

  try {
    const channel = await getChannelContext(project.channel_id);
    const brief = await generateContentBrief({
      workspaceId: ctx.workspaceId,
      topic: project.topic ?? project.title,
      language: project.suggested_language,
      channel,
    });

    const { data: existing } = await supabase
      .from('content_briefs')
      .select('version')
      .eq('content_project_id', contentProjectId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const version = (existing?.version ?? 0) + 1;

    await supabase.from('content_briefs').insert({
      content_project_id: contentProjectId,
      workspace_id: ctx.workspaceId,
      version,
      title: brief.title,
      summary: brief.summary,
      target_audience: brief.target_audience,
      key_points: brief.key_points,
      tone: brief.tone,
      call_to_action: brief.call_to_action,
      content: brief,
    });

    const statusResult = await updateContentProjectStatus(contentProjectId, 'brief_pending_approval');
    if (statusResult.error) return { error: statusResult.error };
    await recordRegeneration(contentProjectId, 'brief');

    revalidatePath(`/dashboard/content/${contentProjectId}`);
    return { success: true, brief };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Generation failed' };
  }
}

export async function generateScriptAction(contentProjectId: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { data: project } = await supabase
    .from('content_projects')
    .select('*')
    .eq('id', contentProjectId)
    .single();

  if (!project) return { error: 'Project not found' };

  const allowedStatuses = ['brief_approved', 'script_pending_approval'];
  if (!allowedStatuses.includes(project.status)) {
    return { error: 'Approve the brief before generating a script' };
  }

  try {
    const channel = await getChannelContext(project.channel_id);
    const script = await generateScript({
      workspaceId: ctx.workspaceId,
      topic: project.topic ?? project.title,
      language: project.suggested_language,
      platform: project.suggested_platform ?? 'youtube',
      channel,
    });

    const { data: existing } = await supabase
      .from('scripts')
      .select('version')
      .eq('content_project_id', contentProjectId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const version = (existing?.version ?? 0) + 1;

    await supabase.from('scripts').insert({
      content_project_id: contentProjectId,
      workspace_id: ctx.workspaceId,
      version,
      hook: script.hook,
      script_body: script.script_body,
      caption: script.caption,
      hashtags: script.hashtags,
      voiceover_script: script.voiceover_script,
      duration_seconds: script.duration_seconds,
    });

    const statusResult = await updateContentProjectStatus(contentProjectId, 'script_pending_approval');
    if (statusResult.error) return { error: statusResult.error };
    await recordRegeneration(contentProjectId, 'script');

    revalidatePath(`/dashboard/content/${contentProjectId}`);
    return { success: true, script };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Generation failed' };
  }
}

export async function generateBlogAction(contentProjectId: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { data: project } = await supabase
    .from('content_projects')
    .select('*')
    .eq('id', contentProjectId)
    .single();

  if (!project) return { error: 'Project not found' };

  try {
    const blog = await generateBlogPost({
      workspaceId: ctx.workspaceId,
      topic: project.topic ?? project.title,
      title: project.title,
      language: project.suggested_language,
    });

    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('content_project_id', contentProjectId)
      .single();

    if (existing) {
      await supabase.from('blog_posts').update({
        title: blog.title,
        meta_title: blog.meta_title,
        meta_description: blog.meta_description,
        slug: blog.slug,
        content: blog.content,
        tags: blog.tags,
        category: blog.category,
        status: 'review',
      }).eq('id', existing.id);
    } else {
      await supabase.from('blog_posts').insert({
        content_project_id: contentProjectId,
        workspace_id: ctx.workspaceId,
        title: blog.title,
        meta_title: blog.meta_title,
        meta_description: blog.meta_description,
        slug: blog.slug,
        content: blog.content,
        tags: blog.tags,
        category: blog.category,
        status: 'review',
      });
    }

    revalidatePath(`/dashboard/content/${contentProjectId}`);
    return { success: true, blog };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Generation failed' };
  }
}

export async function generateCaptionsAction(contentProjectId: string, platform: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { data: script } = await supabase
    .from('scripts')
    .select('*')
    .eq('content_project_id', contentProjectId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const { data: project } = await supabase
    .from('content_projects')
    .select('*')
    .eq('id', contentProjectId)
    .single();

  try {
    const caption = await generateCaptions({
      workspaceId: ctx.workspaceId,
      topic: project?.topic ?? '',
      platform,
      hook: script?.hook ?? '',
      language: project?.suggested_language,
    });

    const hashtags = await generateHashtags({
      workspaceId: ctx.workspaceId,
      topic: project?.topic ?? '',
      platform,
      channel: await getChannelContext(project?.channel_id ?? null),
    });

    if (script) {
      await supabase.from('scripts').update({
        caption,
        hashtags,
        platform_variants: { ...((script.platform_variants as object) ?? {}), [platform]: { caption, hashtags } },
      }).eq('id', script.id);
    }

    revalidatePath(`/dashboard/content/${contentProjectId}`);
    return { success: true, caption, hashtags };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Generation failed' };
  }
}

export async function saveIntegrationCredential(provider: string, apiKey: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  if (!process.env.CREDENTIALS_ENCRYPTION_KEY) {
    return { error: 'CREDENTIALS_ENCRYPTION_KEY is not configured on the server' };
  }

  try {
    const admin = createAdminClient();
    const encrypted = encryptCredential(apiKey);

    const { error } = await admin.from('integration_credentials').upsert({
      workspace_id: ctx.workspaceId,
      provider,
      encrypted_value: encrypted,
      status: 'connected',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'workspace_id,provider' });

    if (error) return { error: error.message };

    await logAudit({
      workspaceId: ctx.workspaceId,
      userId: ctx.user.id,
      action: 'credential_update',
      entityType: 'integration_credentials',
      details: { provider },
    });

    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard/settings/integrations');
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to save credentials' };
  }
}

export async function testIntegration(provider: string, apiKey?: string) {
  if (provider === 'groq') {
    const ctx = await getUserWorkspace();
    if (!ctx) return { error: 'Not authenticated' };

    let key = apiKey;
    if (!key) {
      const admin = createAdminClient();
      const { data } = await admin
        .from('integration_credentials')
        .select('encrypted_value')
        .eq('workspace_id', ctx.workspaceId)
        .eq('provider', 'groq')
        .single();
      if (!data?.encrypted_value) return { error: 'No API key configured' };
      const { decryptCredential } = await import('@/lib/crypto/credentials');
      key = decryptCredential(data.encrypted_value);
    }

    const ok = await testGroqConnection(key);
    return ok ? { success: true } : { error: 'Connection failed' };
  }

  return { error: 'Test not implemented for this provider yet' };
}

export async function disconnectIntegration(provider: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  try {
    const admin = createAdminClient();
    const { error } = await admin.from('integration_credentials').update({
      encrypted_value: null,
      status: 'not_connected',
    }).eq('workspace_id', ctx.workspaceId).eq('provider', provider);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard/settings/integrations');
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to disconnect' };
  }
}

export async function runResearch(niche: string, targetAudience: string, language: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  try {
    const topics = await researchTopics({
      workspaceId: ctx.workspaceId,
      channel: { niche, target_audience: targetAudience },
      target_audience: targetAudience,
      language,
    });

    const supabase = await createClient();
    for (const topic of topics) {
      await supabase.from('trend_research').insert({
        workspace_id: ctx.workspaceId,
        topic: topic.topic,
        trend_score: topic.trend_score,
        monetization_score: topic.monetization_score,
        competition_score: topic.competition_score,
        difficulty_score: topic.difficulty_score,
        suggested_platform: topic.suggested_platform as 'youtube',
        suggested_language: language,
        suggested_format: topic.suggested_format,
        research_data: topic,
        source: 'ai',
      });
    }

    revalidatePath('/dashboard/research');
    return { success: true, topics };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Research failed' };
  }
}

export async function generateStoryboardAction(contentProjectId: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { data: script } = await supabase
    .from('scripts')
    .select('*')
    .eq('content_project_id', contentProjectId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const { data: project } = await supabase
    .from('content_projects')
    .select('*')
    .eq('id', contentProjectId)
    .single();

  if (!project) return { error: 'Project not found' };

  const allowedStatuses = ['script_approved', 'assets_pending_approval', 'assets_approved'];
  if (!allowedStatuses.includes(project.status)) {
    return { error: 'Approve the script before generating a storyboard' };
  }

  try {
    const storyboard = await generateStoryboard({
      workspaceId: ctx.workspaceId,
      script_body: script?.script_body ?? '',
      duration_seconds: script?.duration_seconds ?? 60,
      platform: project?.suggested_platform ?? 'youtube',
    });

    const { data: existing } = await supabase
      .from('video_storyboards')
      .select('version')
      .eq('content_project_id', contentProjectId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const version = (existing?.version ?? 0) + 1;

    await supabase.from('video_storyboards').insert({
      content_project_id: contentProjectId,
      workspace_id: ctx.workspaceId,
      version,
      scenes: storyboard.scenes,
      total_duration_seconds: storyboard.total_duration_seconds,
    });

    revalidatePath(`/dashboard/content/${contentProjectId}`);
    return { success: true, storyboard };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Storyboard generation failed' };
  }
}