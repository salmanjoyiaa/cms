import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getUserWorkspace } from '@/lib/supabase/server';
import { listIntegrations } from '@/lib/actions/publishing';
import { IntegrationCard } from '@/components/settings/integration-card';
import { ProfileForm, WorkspaceForm } from '@/components/settings/settings-forms';

export default async function SettingsPage() {
  const ctx = await getUserWorkspace();
  if (!ctx) return null;

  const credentials = await listIntegrations();
  const groqCred = credentials.find((c) => c.provider === 'groq');

  return (
    <div>
      <PageHeader title="Settings" description="Manage your profile, workspace, and AI provider credentials.">
        <Button variant="outline" asChild>
          <Link href="/dashboard/settings/integrations">All Integrations</Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 max-w-2xl">
        <Card className="glass-card">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold">Profile</h3>
            <ProfileForm
              defaultFullName={ctx.user.user_metadata?.full_name ?? ''}
              email={ctx.user.email ?? ''}
            />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold">Workspace</h3>
            <WorkspaceForm workspaceId={ctx.workspaceId} defaultName={ctx.workspace.name} />
          </CardContent>
        </Card>

        <div>
          <h3 className="font-semibold mb-4">Primary AI Provider — Groq</h3>
          <IntegrationCard
            integration={{
              provider: 'groq',
              name: 'Groq',
              type: 'api_key',
              description: 'Default provider for research, briefs, scripts, and blog generation. Get your API key at console.groq.com',
            }}
            credential={groqCred}
          />
        </div>
      </div>
    </div>
  );
}
