import { PageHeader } from '@/components/dashboard/page-header';
import { listIntegrations } from '@/lib/actions/publishing';
import { IntegrationsClient } from '@/components/settings/integration-card';

export default async function IntegrationsPage() {
  const credentials = await listIntegrations();

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Connect AI providers and social platforms. API keys are encrypted and never exposed to the browser."
      />
      <IntegrationsClient credentials={credentials} />
    </div>
  );
}
