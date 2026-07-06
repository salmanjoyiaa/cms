import {
  fillTemplate,
  parseJsonFromAI,
  type GenerateContext,
  type ResearchTopicResult,
  type ContentBriefResult,
  type ScriptResult,
  type BlogPostResult,
  type StoryboardResult,
  type RecommendationResult,
} from './types';
import { getProviderForTask, getPromptTemplate } from './router';

function buildVars(ctx: GenerateContext): Record<string, string> {
  return {
    topic: ctx.topic ?? '',
    title: ctx.title ?? '',
    language: ctx.language ?? 'en',
    platform: ctx.platform ?? 'youtube',
    'channel.name': ctx.channel?.name ?? '',
    'channel.niche': ctx.channel?.niche ?? '',
    'channel.target_audience': ctx.channel?.target_audience ?? '',
    'channel.brand_style': ctx.channel?.brand_style ?? '',
    target_audience: ctx.target_audience ?? ctx.channel?.target_audience ?? '',
    script_body: ctx.script_body ?? '',
    hook: ctx.hook ?? '',
    duration_seconds: String(ctx.duration_seconds ?? 60),
    use_case: ctx.use_case ?? 'thumbnail',
  };
}

export async function researchTopics(ctx: GenerateContext): Promise<ResearchTopicResult[]> {
  const { provider, model } = await getProviderForTask(ctx.workspaceId, 'research');
  const template = await getPromptTemplate(ctx.workspaceId, 'research');
  if (!template) throw new Error('Research prompt template not found');

  const prompt = fillTemplate(template, buildVars(ctx));
  const response = await provider.chatCompletion(
    prompt,
    'You are a viral content research analyst. Always respond with valid JSON.',
    model
  );
  return parseJsonFromAI<ResearchTopicResult[]>(response);
}

export async function scoreTrend(ctx: GenerateContext & { topic: string }): Promise<ResearchTopicResult> {
  const topics = await researchTopics(ctx);
  return topics.find((t) => t.topic === ctx.topic) ?? topics[0];
}

export async function generateContentBrief(ctx: GenerateContext): Promise<ContentBriefResult> {
  const { provider, model } = await getProviderForTask(ctx.workspaceId, 'brief');
  const template = await getPromptTemplate(ctx.workspaceId, 'brief');
  if (!template) throw new Error('Brief prompt template not found');

  const prompt = fillTemplate(template, buildVars(ctx));
  const response = await provider.chatCompletion(
    prompt,
    'You are a content strategist. Always respond with valid JSON.',
    model
  );
  return parseJsonFromAI<ContentBriefResult>(response);
}

export async function generateScript(ctx: GenerateContext): Promise<ScriptResult> {
  const { provider, model } = await getProviderForTask(ctx.workspaceId, 'script');
  const template = await getPromptTemplate(ctx.workspaceId, 'script');
  if (!template) throw new Error('Script prompt template not found');

  const prompt = fillTemplate(template, buildVars(ctx));
  const response = await provider.chatCompletion(
    prompt,
    'You are a viral short-form video scriptwriter. Always respond with valid JSON.',
    model
  );
  return parseJsonFromAI<ScriptResult>(response);
}

export async function generateBlogPost(ctx: GenerateContext): Promise<BlogPostResult> {
  const { provider, model } = await getProviderForTask(ctx.workspaceId, 'blog');
  const template = await getPromptTemplate(ctx.workspaceId, 'blog');
  if (!template) throw new Error('Blog prompt template not found');

  const prompt = fillTemplate(template, buildVars(ctx));
  const response = await provider.chatCompletion(
    prompt,
    'You are an SEO content writer. Always respond with valid JSON.',
    model
  );
  return parseJsonFromAI<BlogPostResult>(response);
}

export async function generateCaptions(ctx: GenerateContext): Promise<string> {
  const { provider, model } = await getProviderForTask(ctx.workspaceId, 'caption');
  const template = await getPromptTemplate(ctx.workspaceId, 'caption');
  if (!template) throw new Error('Caption prompt template not found');

  const prompt = fillTemplate(template, buildVars(ctx));
  return provider.chatCompletion(prompt, 'You are a social media copywriter.', model);
}

export async function generateHashtags(ctx: GenerateContext): Promise<string[]> {
  const { provider, model } = await getProviderForTask(ctx.workspaceId, 'caption');
  const template = await getPromptTemplate(ctx.workspaceId, 'hashtag');
  if (!template) throw new Error('Hashtag prompt template not found');

  const prompt = fillTemplate(template, buildVars(ctx));
  const response = await provider.chatCompletion(
    prompt,
    'Return only a JSON array of hashtag strings.',
    model
  );
  return parseJsonFromAI<string[]>(response);
}

export async function generateImagePrompts(ctx: GenerateContext): Promise<{
  thumbnail_prompt: string;
  scene_prompts: string[];
}> {
  const { provider, model } = await getProviderForTask(ctx.workspaceId, 'script');
  const template = await getPromptTemplate(ctx.workspaceId, 'image_prompt');
  if (!template) throw new Error('Image prompt template not found');

  const prompt = fillTemplate(template, buildVars(ctx));
  const response = await provider.chatCompletion(prompt, 'Respond with valid JSON.', model);
  return parseJsonFromAI(response);
}

export async function generateStoryboard(ctx: GenerateContext): Promise<StoryboardResult> {
  const { provider, model } = await getProviderForTask(ctx.workspaceId, 'script');
  const template = await getPromptTemplate(ctx.workspaceId, 'storyboard');
  if (!template) throw new Error('Storyboard prompt template not found');

  const prompt = fillTemplate(template, buildVars(ctx));
  const response = await provider.chatCompletion(prompt, 'Respond with valid JSON.', model);
  const scenes = parseJsonFromAI<StoryboardResult['scenes']>(response);
  const total = scenes.reduce((sum, s) => sum + s.duration_seconds, 0);
  return { scenes, total_duration_seconds: total };
}

export async function generateVoiceoverScript(ctx: GenerateContext): Promise<string> {
  const { provider, model } = await getProviderForTask(ctx.workspaceId, 'script');
  const template = await getPromptTemplate(ctx.workspaceId, 'voiceover');
  if (!template) throw new Error('Voiceover prompt template not found');

  const prompt = fillTemplate(template, buildVars(ctx));
  return provider.chatCompletion(prompt, 'You are a voiceover script writer.', model);
}

export async function analyzePerformance(workspaceId: string): Promise<Record<string, unknown>> {
  const { provider, model } = await getProviderForTask(workspaceId, 'research');
  const admin = (await import('@/lib/supabase/admin')).createAdminClient();

  const { data: analytics } = await admin
    .from('analytics_snapshots')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('snapshot_date', { ascending: false })
    .limit(30);

  const prompt = `Analyze this content performance data and summarize key insights:\n${JSON.stringify(analytics ?? [], null, 2)}`;
  const response = await provider.chatCompletion(prompt, 'You are a content analytics expert. Respond with JSON.', model);
  return parseJsonFromAI(response);
}

export async function recommendNextContent(workspaceId: string): Promise<RecommendationResult> {
  const analysis = await analyzePerformance(workspaceId);
  const { provider, model } = await getProviderForTask(workspaceId, 'research');

  const prompt = `Based on this performance analysis, recommend next content strategy:\n${JSON.stringify(analysis, null, 2)}

Return JSON with: next_topics, better_hooks, better_posting_times, better_languages, channels_to_scale, channels_to_pause, best_formats, summary`;

  const response = await provider.chatCompletion(prompt, 'You are a content strategy advisor. Respond with valid JSON.', model);
  return parseJsonFromAI<RecommendationResult>(response);
}

export * from './types';
export { ProviderNotConfiguredError } from './types';
