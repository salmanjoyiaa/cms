import { redirect } from 'next/navigation';
import { getUserWorkspace } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/dashboard/sidebar';
import { getMissingEnvMessage } from '@/lib/env';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getUserWorkspace();
  if (!ctx) redirect('/login');

  const envWarning = getMissingEnvMessage();

  return (
    <DashboardShell workspaceName={ctx.workspace.name}>
      {envWarning && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {envWarning}
        </div>
      )}
      {children}
    </DashboardShell>
  );
}
