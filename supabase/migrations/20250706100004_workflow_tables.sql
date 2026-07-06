-- Workflow tables

CREATE TABLE approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_project_id UUID NOT NULL REFERENCES content_projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  step_type approval_step_type NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  version INT NOT NULL DEFAULT 1,
  notes TEXT,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE publish_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  content_project_id UUID NOT NULL REFERENCES content_projects(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  platform_account_id UUID,
  scheduled_at TIMESTAMPTZ,
  publish_mode publish_mode NOT NULL DEFAULT 'manual',
  status publish_status NOT NULL DEFAULT 'draft',
  error_message TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE platform_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  content_project_id UUID REFERENCES content_projects(id) ON DELETE SET NULL,
  publish_queue_id UUID REFERENCES publish_queue(id) ON DELETE SET NULL,
  platform platform_type NOT NULL,
  platform_post_id TEXT,
  platform_url TEXT,
  status publish_status NOT NULL DEFAULT 'draft',
  metadata JSONB DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_approval_steps_project ON approval_steps(content_project_id);
CREATE INDEX idx_publish_queue_workspace ON publish_queue(workspace_id);
CREATE INDEX idx_publish_queue_scheduled ON publish_queue(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_platform_posts_workspace ON platform_posts(workspace_id);
