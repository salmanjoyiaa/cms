import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

export async function getUserWorkspace() {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return null;

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
