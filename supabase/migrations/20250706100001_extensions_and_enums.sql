-- Extensions and enums
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Channel status
CREATE TYPE channel_status AS ENUM ('testing', 'active', 'paused', 'scaling');

-- Content project status
CREATE TYPE content_project_status AS ENUM (
  'idea',
  'researched',
  'brief_pending_approval',
  'brief_approved',
  'script_pending_approval',
  'script_approved',
  'assets_pending_approval',
  'assets_approved',
  'render_pending',
  'ready_to_publish',
  'scheduled',
  'published',
  'failed',
  'archived'
);

-- Publish queue
CREATE TYPE publish_mode AS ENUM ('manual', 'semi_auto', 'auto');
CREATE TYPE publish_status AS ENUM ('draft', 'queued', 'scheduled', 'published', 'failed');

-- Integration
CREATE TYPE integration_status AS ENUM ('not_connected', 'connected', 'expired', 'needs_review');

-- Approval
CREATE TYPE approval_step_type AS ENUM ('research', 'brief', 'script', 'assets', 'publish');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'regenerated');

-- Blog
CREATE TYPE blog_post_status AS ENUM ('draft', 'review', 'scheduled', 'published');

-- Asset
CREATE TYPE asset_type AS ENUM ('image', 'audio', 'video', 'thumbnail', 'document');
CREATE TYPE asset_status AS ENUM ('pending', 'approved', 'rejected');

-- Workspace member role
CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Platform
CREATE TYPE platform_type AS ENUM (
  'youtube', 'instagram', 'facebook', 'tiktok', 'linkedin', 'pinterest', 'blog'
);

-- AI provider
CREATE TYPE ai_provider_type AS ENUM (
  'groq', 'openai', 'gemini', 'anthropic', 'elevenlabs', 'replicate', 'runway', 'pika', 'heygen'
);

-- Integration provider (includes OAuth platforms)
CREATE TYPE integration_provider AS ENUM (
  'groq', 'openai', 'gemini', 'anthropic', 'elevenlabs', 'replicate', 'runway', 'pika', 'heygen',
  'google_youtube', 'facebook', 'instagram', 'tiktok', 'linkedin', 'pinterest',
  'google_adsense', 'google_analytics', 'vercel', 'supabase'
);

-- Prompt category
CREATE TYPE prompt_category AS ENUM (
  'research', 'brief', 'script', 'blog', 'caption', 'hashtag',
  'image_prompt', 'storyboard', 'voiceover'
);

-- Audit action
CREATE TYPE audit_action AS ENUM (
  'approval', 'rejection', 'regeneration', 'credential_update',
  'publish_attempt', 'publish_success', 'publish_failure', 'content_create', 'content_update'
);
