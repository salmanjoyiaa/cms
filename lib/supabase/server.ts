import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  );
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export type UserWorkspaceContext = {
  user: User;
  workspaceId: string;
  role: string;
  workspace: { id: string; name: string; slug: string };
};

async function fetchUserWorkspace(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User
): Promise<UserWorkspaceContext | null> {
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(id, name, slug)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (!membership) return null;

  const workspaceRaw = membership.workspaces as unknown;
  const workspace = (Array.isArray(workspaceRaw) ? workspaceRaw[0] : workspaceRaw) as {
    id: string;
    name: string;
    slug: string;
  } | null;
  if (!workspace) return null;

  return {
    user,
    workspaceId: membership.workspace_id,
    role: membership.role,
    workspace,
  };
}

export async function ensureUserWorkspace(user: User): Promise<UserWorkspaceContext | null> {
  const supabase = await createClient();
  const existing = await fetchUserWorkspace(supabase, user);
  if (existing) return existing;

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split('@')[0] ??
    'User';

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email ?? '',
    full_name: fullName,
    avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
  });

  if (profileError) {
    console.error('[ensureUserWorkspace] profile upsert failed:', profileError.message);
    return null;
  }

  const workspaceSlug = `workspace-${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;

  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({
      name: 'My Workspace',
      slug: workspaceSlug,
      owner_id: user.id,
    })
    .select('id, name, slug')
    .single();

  if (workspaceError || !workspace) {
    console.error('[ensureUserWorkspace] workspace insert failed:', workspaceError?.message);
    return null;
  }

  const { error: memberError } = await supabase.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: 'owner',
  });

  if (memberError) {
    console.error('[ensureUserWorkspace] membership insert failed:', memberError.message);
    return null;
  }

  const defaultSettings = ['research', 'brief', 'script', 'blog', 'caption'].map((task_type) => ({
    workspace_id: workspace.id,
    task_type,
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
  }));

  await supabase.from('ai_provider_settings').insert(defaultSettings);

  return {
    user,
    workspaceId: workspace.id,
    role: 'owner',
    workspace,
  };
}

export async function getUserWorkspace(): Promise<UserWorkspaceContext | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const existing = await fetchUserWorkspace(supabase, user);
  if (existing) return existing;

  return ensureUserWorkspace(user);
}
