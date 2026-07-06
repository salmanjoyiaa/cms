-- RLS helper function and policies

CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_workspace_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid();
$$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_storyboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE publish_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE monetization_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Workspaces
CREATE POLICY "Members can view workspaces" ON workspaces FOR SELECT USING (is_workspace_member(id));
CREATE POLICY "Owners can update workspaces" ON workspaces FOR UPDATE USING (
  EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
);
CREATE POLICY "Users can create workspaces" ON workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Workspace members
CREATE POLICY "Members can view workspace members" ON workspace_members FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "Admins can manage members" ON workspace_members FOR ALL USING (
  EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = workspace_members.workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin'))
);

-- Generic workspace-scoped policies macro pattern
CREATE POLICY "workspace_select_channels" ON channels FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_channels" ON channels FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_channels" ON channels FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_delete_channels" ON channels FOR DELETE USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_select_content_projects" ON content_projects FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_content_projects" ON content_projects FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_content_projects" ON content_projects FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_delete_content_projects" ON content_projects FOR DELETE USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_select_trend_research" ON trend_research FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_trend_research" ON trend_research FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_trend_research" ON trend_research FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_delete_trend_research" ON trend_research FOR DELETE USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_select_content_briefs" ON content_briefs FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_content_briefs" ON content_briefs FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_content_briefs" ON content_briefs FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_delete_content_briefs" ON content_briefs FOR DELETE USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_select_scripts" ON scripts FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_scripts" ON scripts FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_scripts" ON scripts FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_delete_scripts" ON scripts FOR DELETE USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_select_blog_posts" ON blog_posts FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_blog_posts" ON blog_posts FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_blog_posts" ON blog_posts FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_delete_blog_posts" ON blog_posts FOR DELETE USING (is_workspace_member(workspace_id));

-- Public read for published blog posts (anon access)
CREATE POLICY "public_read_published_blog_posts" ON blog_posts FOR SELECT USING (status = 'published');

CREATE POLICY "workspace_select_assets" ON assets FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_assets" ON assets FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_assets" ON assets FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_delete_assets" ON assets FOR DELETE USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_select_video_storyboards" ON video_storyboards FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_video_storyboards" ON video_storyboards FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_video_storyboards" ON video_storyboards FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_delete_video_storyboards" ON video_storyboards FOR DELETE USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_select_prompt_templates" ON prompt_templates FOR SELECT USING (
  is_system = true OR (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
);
CREATE POLICY "workspace_insert_prompt_templates" ON prompt_templates FOR INSERT WITH CHECK (
  workspace_id IS NOT NULL AND is_workspace_member(workspace_id) AND is_system = false
);
CREATE POLICY "workspace_update_prompt_templates" ON prompt_templates FOR UPDATE USING (
  workspace_id IS NOT NULL AND is_workspace_member(workspace_id) AND is_system = false
);
CREATE POLICY "workspace_delete_prompt_templates" ON prompt_templates FOR DELETE USING (
  workspace_id IS NOT NULL AND is_workspace_member(workspace_id) AND is_system = false
);

CREATE POLICY "workspace_select_approval_steps" ON approval_steps FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_approval_steps" ON approval_steps FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_approval_steps" ON approval_steps FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_delete_approval_steps" ON approval_steps FOR DELETE USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_select_publish_queue" ON publish_queue FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_publish_queue" ON publish_queue FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_publish_queue" ON publish_queue FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_delete_publish_queue" ON publish_queue FOR DELETE USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_select_platform_posts" ON platform_posts FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_platform_posts" ON platform_posts FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_platform_posts" ON platform_posts FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_delete_platform_posts" ON platform_posts FOR DELETE USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_select_analytics" ON analytics_snapshots FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_analytics" ON analytics_snapshots FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_analytics" ON analytics_snapshots FOR UPDATE USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_select_monetization" ON monetization_snapshots FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_monetization" ON monetization_snapshots FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_monetization" ON monetization_snapshots FOR UPDATE USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_select_audit_logs" ON audit_logs FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_audit_logs" ON audit_logs FOR INSERT WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "workspace_select_platform_accounts" ON platform_accounts FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_platform_accounts" ON platform_accounts FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_platform_accounts" ON platform_accounts FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_delete_platform_accounts" ON platform_accounts FOR DELETE USING (is_workspace_member(workspace_id));

-- Integration credentials: metadata only for clients (no encrypted_value in SELECT for authenticated)
CREATE POLICY "workspace_select_integration_metadata" ON integration_credentials FOR SELECT USING (
  is_workspace_member(workspace_id)
);
CREATE POLICY "workspace_insert_integration_credentials" ON integration_credentials FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_integration_credentials" ON integration_credentials FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_delete_integration_credentials" ON integration_credentials FOR DELETE USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_select_ai_settings" ON ai_provider_settings FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_insert_ai_settings" ON ai_provider_settings FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_update_ai_settings" ON ai_provider_settings FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_delete_ai_settings" ON ai_provider_settings FOR DELETE USING (is_workspace_member(workspace_id));

-- View for integration credentials without encrypted values (for client-safe queries)
CREATE OR REPLACE VIEW integration_credentials_safe
WITH (security_invoker = true)
AS
SELECT
  id, workspace_id, provider, status, metadata, scopes, last_sync_at, expires_at, created_at, updated_at,
  (encrypted_value IS NOT NULL) AS has_credentials
FROM integration_credentials;

GRANT SELECT ON integration_credentials_safe TO authenticated;
