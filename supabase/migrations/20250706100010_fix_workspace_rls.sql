-- Fix workspace RLS chicken-and-egg: users must read their own membership rows

DROP POLICY IF EXISTS "Members can view workspace members" ON workspace_members;
CREATE POLICY "Members can view workspace members" ON workspace_members
  FOR SELECT USING (user_id = auth.uid() OR is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Members can view workspaces" ON workspaces;
CREATE POLICY "Members can view workspaces" ON workspaces
  FOR SELECT USING (owner_id = auth.uid() OR is_workspace_member(id));

CREATE POLICY "Users can insert own membership" ON workspace_members
  FOR INSERT WITH CHECK (user_id = auth.uid());
