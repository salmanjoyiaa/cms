import { createAdminClient } from '@/lib/supabase/admin';
import { createGroqProvider } from './providers/groq';
import type { AIProvider } from './types';
import { ProviderNotConfiguredError } from './types';
import type { AiProviderType } from '@/lib/types/database';

export async function getProviderForTask(
  workspaceId: string,
  taskType: string
): Promise<{ provider: AIProvider; model?: string }> {
  const admin = createAdminClient();

  const { data: settings } = await admin
    .from('ai_provider_settings')
    .select('provider, model')
    .eq('workspace_id', workspaceId)
    .eq('task_type', taskType)
    .single();

  const providerName = (settings?.provider ?? 'groq') as AiProviderType;
  const model = settings?.model ?? undefined;

  switch (providerName) {
    case 'groq':
      return { provider: await createGroqProvider(workspaceId), model };
    default:
      throw new ProviderNotConfiguredError(providerName);
  }
}

export async function getPromptTemplate(
  workspaceId: string,
  category: string
): Promise<string | null> {
  const admin = createAdminClient();

  const { data: workspaceTemplate } = await admin
    .from('prompt_templates')
    .select('template')
    .eq('workspace_id', workspaceId)
    .eq('category', category)
    .eq('is_system', false)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (workspaceTemplate?.template) return workspaceTemplate.template;

  const { data: systemTemplate } = await admin
    .from('prompt_templates')
    .select('template')
    .is('workspace_id', null)
    .eq('category', category)
    .eq('is_system', true)
    .limit(1)
    .single();

  return systemTemplate?.template ?? null;
}
