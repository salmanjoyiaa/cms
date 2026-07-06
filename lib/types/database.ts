export type ChannelStatus = 'testing' | 'active' | 'paused' | 'scaling';

export type ContentProjectStatus =
  | 'idea'
  | 'researched'
  | 'brief_pending_approval'
  | 'brief_approved'
  | 'script_pending_approval'
  | 'script_approved'
  | 'assets_pending_approval'
  | 'assets_approved'
  | 'render_pending'
  | 'ready_to_publish'
  | 'scheduled'
  | 'published'
  | 'failed'
  | 'archived';

export type PublishMode = 'manual' | 'semi_auto' | 'auto';
export type PublishStatus = 'draft' | 'queued' | 'scheduled' | 'published' | 'failed';
export type IntegrationStatus = 'not_connected' | 'connected' | 'expired' | 'needs_review';
export type ApprovalStepType = 'research' | 'brief' | 'script' | 'assets' | 'publish';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'regenerated';
export type BlogPostStatus = 'draft' | 'review' | 'scheduled' | 'published';
export type AssetType = 'image' | 'audio' | 'video' | 'thumbnail' | 'document';
export type AssetStatus = 'pending' | 'approved' | 'rejected';
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';
export type PlatformType =
  | 'youtube'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'linkedin'
  | 'pinterest'
  | 'blog';

export type AiProviderType =
  | 'groq'
  | 'openai'
  | 'gemini'
  | 'anthropic'
  | 'elevenlabs'
  | 'replicate'
  | 'runway'
  | 'pika'
  | 'heygen';

export type IntegrationProvider =
  | AiProviderType
  | 'google_youtube'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'linkedin'
  | 'pinterest'
  | 'google_adsense'
  | 'google_analytics'
  | 'vercel'
  | 'supabase';

export type PromptCategory =
  | 'research'
  | 'brief'
  | 'script'
  | 'blog'
  | 'caption'
  | 'hashtag'
  | 'image_prompt'
  | 'storyboard'
  | 'voiceover';

export type AuditAction =
  | 'approval'
  | 'rejection'
  | 'regeneration'
  | 'credential_update'
  | 'publish_attempt'
  | 'publish_success'
  | 'publish_failure'
  | 'content_create'
  | 'content_update';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
}

export interface Channel {
  id: string;
  workspace_id: string;
  name: string;
  niche: string | null;
  target_audience: string | null;
  language: string;
  platforms: string[];
  brand_style: string | null;
  posting_frequency: string | null;
  monetization_goal: string | null;
  status: ChannelStatus;
  created_at: string;
  updated_at: string;
}

export interface ContentProject {
  id: string;
  workspace_id: string;
  channel_id: string | null;
  title: string;
  topic: string | null;
  status: ContentProjectStatus;
  suggested_platform: PlatformType | null;
  suggested_language: string;
  suggested_format: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  channels?: Channel | null;
}

export interface TrendResearch {
  id: string;
  workspace_id: string;
  content_project_id: string | null;
  topic: string;
  trend_score: number | null;
  monetization_score: number | null;
  competition_score: number | null;
  difficulty_score: number | null;
  suggested_platform: PlatformType | null;
  suggested_language: string | null;
  suggested_format: string | null;
  research_data: Record<string, unknown>;
  source: string;
  created_at: string;
}

export interface ContentBrief {
  id: string;
  content_project_id: string;
  workspace_id: string;
  version: number;
  title: string | null;
  summary: string | null;
  target_audience: string | null;
  key_points: string[];
  tone: string | null;
  call_to_action: string | null;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Script {
  id: string;
  content_project_id: string;
  workspace_id: string;
  version: number;
  hook: string | null;
  script_body: string | null;
  caption: string | null;
  hashtags: string[];
  platform_variants: Record<string, unknown>;
  voiceover_script: string | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  content_project_id: string | null;
  workspace_id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  content: string | null;
  featured_image_url: string | null;
  tags: string[];
  category: string | null;
  status: BlogPostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  content_project_id: string | null;
  workspace_id: string;
  type: AssetType;
  name: string;
  storage_path: string | null;
  public_url: string | null;
  metadata: Record<string, unknown>;
  status: AssetStatus;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface VideoStoryboard {
  id: string;
  content_project_id: string;
  workspace_id: string;
  version: number;
  scenes: StoryboardScene[];
  total_duration_seconds: number | null;
  render_status: string;
  render_output_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoryboardScene {
  scene_number: number;
  duration_seconds: number;
  visual_description: string;
  narration: string;
  image_prompt?: string;
}

export interface PromptTemplate {
  id: string;
  workspace_id: string | null;
  category: PromptCategory;
  name: string;
  description: string | null;
  template: string;
  variables: string[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApprovalStep {
  id: string;
  content_project_id: string;
  workspace_id: string;
  step_type: ApprovalStepType;
  status: ApprovalStatus;
  version: number;
  notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  profiles?: Profile | null;
}

export interface PublishQueueItem {
  id: string;
  workspace_id: string;
  content_project_id: string;
  platform: PlatformType;
  platform_account_id: string | null;
  scheduled_at: string | null;
  publish_mode: PublishMode;
  status: PublishStatus;
  error_message: string | null;
  retry_count: number;
  metadata: Record<string, unknown>;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  content_projects?: ContentProject | null;
}

export interface IntegrationCredentialSafe {
  id: string;
  workspace_id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  metadata: Record<string, unknown>;
  scopes: string | null;
  last_sync_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  has_credentials: boolean;
}

export interface AnalyticsSnapshot {
  id: string;
  workspace_id: string;
  platform_post_id: string | null;
  content_project_id: string | null;
  platform: PlatformType | null;
  snapshot_date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  watch_time_seconds: number;
  ctr: number | null;
  blog_page_views: number;
  search_impressions: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface MonetizationSnapshot {
  id: string;
  workspace_id: string;
  platform: PlatformType | null;
  snapshot_date: string;
  adsense_earnings: number;
  youtube_earnings: number;
  facebook_earnings: number;
  instagram_earnings: number;
  other_earnings: number;
  currency: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  workspace_id: string;
  user_id: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

type TableDef<T> = { Row: T; Insert: Record<string, unknown>; Update: Record<string, unknown> };

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      workspaces: TableDef<Workspace>;
      workspace_members: TableDef<WorkspaceMember>;
      channels: TableDef<Channel>;
      content_projects: TableDef<ContentProject>;
      trend_research: TableDef<TrendResearch>;
      content_briefs: TableDef<ContentBrief>;
      scripts: TableDef<Script>;
      blog_posts: TableDef<BlogPost>;
      assets: TableDef<Asset>;
      video_storyboards: TableDef<VideoStoryboard>;
      prompt_templates: TableDef<PromptTemplate>;
      approval_steps: TableDef<ApprovalStep>;
      publish_queue: TableDef<PublishQueueItem>;
      integration_credentials: TableDef<{ id: string; workspace_id: string; provider: IntegrationProvider; status: IntegrationStatus; encrypted_value: string | null; metadata: Record<string, unknown>; scopes: string | null; last_sync_at: string | null; expires_at: string | null; created_at: string; updated_at: string }>;
      ai_provider_settings: TableDef<{ id: string; workspace_id: string; task_type: string; provider: AiProviderType; model: string | null; settings: Record<string, unknown>; created_at: string; updated_at: string }>;
      analytics_snapshots: TableDef<AnalyticsSnapshot>;
      monetization_snapshots: TableDef<MonetizationSnapshot>;
      audit_logs: TableDef<AuditLog>;
      platform_accounts: TableDef<Record<string, unknown>>;
      platform_posts: TableDef<Record<string, unknown>>;
    };
    Views: {
      integration_credentials_safe: { Row: IntegrationCredentialSafe };
    };
  };
}
