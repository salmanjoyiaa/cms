-- Analytics and audit tables

CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform_post_id UUID REFERENCES platform_posts(id) ON DELETE CASCADE,
  content_project_id UUID REFERENCES content_projects(id) ON DELETE SET NULL,
  platform platform_type,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  saves BIGINT DEFAULT 0,
  watch_time_seconds BIGINT DEFAULT 0,
  ctr NUMERIC(8,4),
  blog_page_views BIGINT DEFAULT 0,
  search_impressions BIGINT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, platform_post_id, snapshot_date)
);

CREATE TABLE monetization_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform platform_type,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  adsense_earnings NUMERIC(12,4) DEFAULT 0,
  youtube_earnings NUMERIC(12,4) DEFAULT 0,
  facebook_earnings NUMERIC(12,4) DEFAULT 0,
  instagram_earnings NUMERIC(12,4) DEFAULT 0,
  other_earnings NUMERIC(12,4) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, platform, snapshot_date)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_snapshots_workspace ON analytics_snapshots(workspace_id);
CREATE INDEX idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date);
CREATE INDEX idx_monetization_snapshots_workspace ON monetization_snapshots(workspace_id);
CREATE INDEX idx_audit_logs_workspace ON audit_logs(workspace_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
