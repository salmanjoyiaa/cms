import type { PromptCategory } from '@/lib/types/database';

export interface AIProvider {
  name: string;
  chatCompletion(prompt: string, systemPrompt?: string, model?: string): Promise<string>;
}

export interface ResearchTopicResult {
  topic: string;
  trend_score: number;
  monetization_score: number;
  competition_score: number;
  difficulty_score: number;
  suggested_platform: string;
  suggested_format: string;
  rationale: string;
}

export interface ContentBriefResult {
  title: string;
  summary: string;
  target_audience: string;
  key_points: string[];
  tone: string;
  call_to_action: string;
}

export interface ScriptResult {
  hook: string;
  script_body: string;
  caption: string;
  hashtags: string[];
  voiceover_script: string;
  duration_seconds: number;
}

export interface BlogPostResult {
  title: string;
  meta_title: string;
  meta_description: string;
  slug: string;
  content: string;
  tags: string[];
  category: string;
}

export interface StoryboardResult {
  scenes: Array<{
    scene_number: number;
    duration_seconds: number;
    visual_description: string;
    narration: string;
    image_prompt?: string;
  }>;
  total_duration_seconds: number;
}

export interface RecommendationResult {
  next_topics: string[];
  better_hooks: string[];
  better_posting_times: string[];
  better_languages: string[];
  channels_to_scale: string[];
  channels_to_pause: string[];
  best_formats: string[];
  summary: string;
}

export interface GenerateContext {
  workspaceId: string;
  topic?: string;
  title?: string;
  language?: string;
  platform?: string;
  channel?: {
    name?: string;
    niche?: string;
    target_audience?: string;
    brand_style?: string;
  };
  script_body?: string;
  hook?: string;
  duration_seconds?: number;
  use_case?: string;
  target_audience?: string;
}

export class ProviderNotConfiguredError extends Error {
  constructor(
    public provider: string,
    message?: string
  ) {
    super(message ?? `${provider} is not configured. Add API credentials in Settings > Integrations.`);
    this.name = 'ProviderNotConfiguredError';
  }
}

export function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value ?? '');
  }
  return result;
}

export function parseJsonFromAI<T>(text: string): T {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ?? text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : text;
  return JSON.parse(jsonStr.trim()) as T;
}

export type { PromptCategory };
