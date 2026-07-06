-- Triggers: profile/workspace bootstrap on signup

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id UUID;
  workspace_slug TEXT;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  workspace_slug := 'workspace-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);

  INSERT INTO public.workspaces (name, slug, owner_id)
  VALUES ('My Workspace', workspace_slug, NEW.id)
  RETURNING id INTO new_workspace_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'owner');

  -- Default AI provider settings for Groq
  INSERT INTO public.ai_provider_settings (workspace_id, task_type, provider, model)
  VALUES
    (new_workspace_id, 'research', 'groq', 'llama-3.3-70b-versatile'),
    (new_workspace_id, 'brief', 'groq', 'llama-3.3-70b-versatile'),
    (new_workspace_id, 'script', 'groq', 'llama-3.3-70b-versatile'),
    (new_workspace_id, 'blog', 'groq', 'llama-3.3-70b-versatile'),
    (new_workspace_id, 'caption', 'groq', 'llama-3.3-70b-versatile');

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER content_projects_updated_at BEFORE UPDATE ON content_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER content_briefs_updated_at BEFORE UPDATE ON content_briefs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER scripts_updated_at BEFORE UPDATE ON scripts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER video_storyboards_updated_at BEFORE UPDATE ON video_storyboards FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER prompt_templates_updated_at BEFORE UPDATE ON prompt_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER approval_steps_updated_at BEFORE UPDATE ON approval_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER publish_queue_updated_at BEFORE UPDATE ON publish_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER platform_accounts_updated_at BEFORE UPDATE ON platform_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER integration_credentials_updated_at BEFORE UPDATE ON integration_credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_provider_settings_updated_at BEFORE UPDATE ON ai_provider_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
