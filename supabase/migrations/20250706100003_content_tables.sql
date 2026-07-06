-- Content tables

CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  niche TEXT,
  target_audience TEXT,
  language TEXT DEFAULT 'en',
  platforms JSONB DEFAULT '[]'::jsonb,
  brand_style TEXT,
  posting_frequency TEXT,
  monetization_goal TEXT,
  status channel_status NOT NULL DEFAULT 'testing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE content_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  topic TEXT,
  status content_project_status NOT NULL DEFAULT 'idea',
  suggested_platform platform_type,
  suggested_language TEXT DEFAULT 'en',
  suggested_format TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trend_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  content_project_id UUID REFERENCES content_projects(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  trend_score NUMERIC(5,2),
  monetization_score NUMERIC(5,2),
  competition_score NUMERIC(5,2),
  difficulty_score NUMERIC(5,2),
  suggested_platform platform_type,
  suggested_language TEXT,
  suggested_format TEXT,
  research_data JSONB DEFAULT '{}'::jsonb,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE content_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_project_id UUID NOT NULL REFERENCES content_projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  title TEXT,
  summary TEXT,
  target_audience TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  tone TEXT,
  call_to_action TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_project_id UUID NOT NULL REFERENCES content_projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  hook TEXT,
  script_body TEXT,
  caption TEXT,
  hashtags JSONB DEFAULT '[]'::jsonb,
  platform_variants JSONB DEFAULT '{}'::jsonb,
  voiceover_script TEXT,
  duration_seconds INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_project_id UUID REFERENCES content_projects(id) ON DELETE SET NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  content TEXT,
  featured_image_url TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  category TEXT,
  status blog_post_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, slug)
);

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_project_id UUID REFERENCES content_projects(id) ON DELETE SET NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type asset_type NOT NULL,
  name TEXT NOT NULL,
  storage_path TEXT,
  public_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status asset_status NOT NULL DEFAULT 'pending',
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE video_storyboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_project_id UUID NOT NULL REFERENCES content_projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  scenes JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_duration_seconds INT,
  render_status TEXT DEFAULT 'pending',
  render_output_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  category prompt_category NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_channels_workspace ON channels(workspace_id);
CREATE INDEX idx_content_projects_workspace ON content_projects(workspace_id);
CREATE INDEX idx_content_projects_status ON content_projects(status);
CREATE INDEX idx_content_briefs_project ON content_briefs(content_project_id);
CREATE INDEX idx_scripts_project ON scripts(content_project_id);
CREATE INDEX idx_blog_posts_workspace ON blog_posts(workspace_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_assets_workspace ON assets(workspace_id);
CREATE INDEX idx_trend_research_workspace ON trend_research(workspace_id);
