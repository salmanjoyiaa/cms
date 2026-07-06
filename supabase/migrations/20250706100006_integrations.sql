-- Integration and platform account tables

CREATE TABLE platform_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  account_name TEXT NOT NULL,
  account_id TEXT,
  channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
  status integration_status NOT NULL DEFAULT 'not_connected',
  metadata JSONB DEFAULT '{}'::jsonb,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE integration_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider integration_provider NOT NULL,
  status integration_status NOT NULL DEFAULT 'not_connected',
  encrypted_value TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  scopes TEXT,
  last_sync_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, provider)
);

CREATE TABLE ai_provider_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  provider ai_provider_type NOT NULL DEFAULT 'groq',
  model TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, task_type)
);

-- Add FK for publish_queue.platform_account_id
ALTER TABLE publish_queue
  ADD CONSTRAINT fk_publish_queue_platform_account
  FOREIGN KEY (platform_account_id) REFERENCES platform_accounts(id) ON DELETE SET NULL;

CREATE INDEX idx_platform_accounts_workspace ON platform_accounts(workspace_id);
CREATE INDEX idx_integration_credentials_workspace ON integration_credentials(workspace_id);
