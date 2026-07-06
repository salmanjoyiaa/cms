'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Unlink, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  saveIntegrationCredential,
  testIntegration,
  disconnectIntegration,
} from '@/lib/actions/ai';
import { toast } from 'sonner';
import type { IntegrationCredentialSafe, IntegrationProvider } from '@/lib/types/database';

const INTEGRATIONS: Array<{
  provider: IntegrationProvider;
  name: string;
  type: 'api_key' | 'oauth';
  scopes?: string;
  description: string;
}> = [
  { provider: 'groq', name: 'Groq', type: 'api_key', description: 'Fast LLM inference for text generation' },
  { provider: 'openai', name: 'OpenAI', type: 'api_key', description: 'GPT models for content generation' },
  { provider: 'gemini', name: 'Google Gemini', type: 'api_key', description: 'Google AI models' },
  { provider: 'anthropic', name: 'Anthropic', type: 'api_key', description: 'Claude models' },
  { provider: 'elevenlabs', name: 'ElevenLabs', type: 'api_key', description: 'AI voice synthesis' },
  { provider: 'replicate', name: 'Replicate', type: 'api_key', description: 'Image and video generation' },
  { provider: 'google_youtube', name: 'Google / YouTube', type: 'oauth', scopes: 'youtube.upload, youtube.readonly', description: 'Upload videos and read analytics' },
  { provider: 'facebook', name: 'Facebook', type: 'oauth', scopes: 'pages_manage_posts, pages_read_engagement', description: 'Publish to Facebook Pages' },
  { provider: 'instagram', name: 'Instagram', type: 'oauth', scopes: 'instagram_content_publish', description: 'Publish Reels and posts' },
  { provider: 'tiktok', name: 'TikTok', type: 'oauth', scopes: 'video.upload', description: 'Upload short-form videos' },
  { provider: 'linkedin', name: 'LinkedIn', type: 'oauth', scopes: 'w_member_social', description: 'Share professional content' },
  { provider: 'pinterest', name: 'Pinterest', type: 'oauth', scopes: 'boards:read,pins:write', description: 'Create pins' },
  { provider: 'google_adsense', name: 'Google AdSense', type: 'oauth', scopes: 'adsense.readonly', description: 'Track ad earnings' },
  { provider: 'google_analytics', name: 'Google Analytics', type: 'oauth', scopes: 'analytics.readonly', description: 'Track blog traffic' },
  { provider: 'vercel', name: 'Vercel', type: 'oauth', description: 'Deployment integration' },
  { provider: 'supabase', name: 'Supabase', type: 'oauth', description: 'Database and auth integration' },
];

const statusColors: Record<string, string> = {
  connected: 'bg-emerald-500/20 text-emerald-400',
  not_connected: 'bg-zinc-500/20 text-zinc-400',
  expired: 'bg-red-500/20 text-red-400',
  needs_review: 'bg-amber-500/20 text-amber-400',
};

export function IntegrationCard({
  integration,
  credential,
}: {
  integration: (typeof INTEGRATIONS)[0];
  credential?: IntegrationCredentialSafe;
}) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [isPending, startTransition] = useTransition();
  const status = credential?.status ?? 'not_connected';

  const handleSave = () => {
    if (!apiKey.trim()) return;
    startTransition(async () => {
      const result = await saveIntegrationCredential(integration.provider, apiKey);
      if (result.error) toast.error(result.error);
      else {
        toast.success('Credentials saved securely');
        setApiKey('');
        router.refresh();
      }
    });
  };

  const handleTest = () => {
    startTransition(async () => {
      const result = await testIntegration(integration.provider, apiKey || undefined);
      if (result.error) toast.error(result.error);
      else toast.success('Connection successful');
    });
  };

  const handleDisconnect = () => {
    startTransition(async () => {
      const result = await disconnectIntegration(integration.provider);
      if (result.error) toast.error(result.error);
      else {
        toast.success('Disconnected');
        router.refresh();
      }
    });
  };

  const handleOAuthConnect = () => {
    toast.info('OAuth integration coming soon — connect API keys for now.');
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{integration.name}</CardTitle>
            <CardDescription className="mt-1">{integration.description}</CardDescription>
          </div>
          <Badge className={statusColors[status]}>{status.replace('_', ' ')}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {integration.scopes && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Required scopes:</span> {integration.scopes}
          </p>
        )}
        {credential?.last_sync_at && (
          <p className="text-xs text-muted-foreground">
            Last sync: {new Date(credential.last_sync_at).toLocaleString()}
          </p>
        )}
        {integration.type === 'api_key' ? (
          <div className="space-y-2">
            <Label>API Key {credential?.has_credentials && '(configured)'}</Label>
            <Input
              type="password"
              placeholder="Enter API key — stored encrypted, never exposed to browser"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={isPending}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleTest} disabled={isPending}>
                <TestTube className="h-3 w-3 mr-1" /> Test
              </Button>
              {credential?.has_credentials && (
                <Button size="sm" variant="ghost" onClick={handleDisconnect} disabled={isPending}>
                  <Unlink className="h-3 w-3 mr-1" /> Disconnect
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-amber-400/80">
              OAuth flow placeholder — app review may be required for production API access.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleOAuthConnect}>
                <Link2 className="h-3 w-3 mr-1" /> Connect
              </Button>
              {status === 'connected' && (
                <Button size="sm" variant="ghost" onClick={handleDisconnect}>
                  <Unlink className="h-3 w-3 mr-1" /> Disconnect
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function IntegrationsClient({ credentials }: { credentials: IntegrationCredentialSafe[] }) {
  const credMap = Object.fromEntries(credentials.map((c) => [c.provider, c]));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {INTEGRATIONS.map((integration) => (
        <IntegrationCard
          key={integration.provider}
          integration={integration}
          credential={credMap[integration.provider]}
        />
      ))}
    </div>
  );
}
