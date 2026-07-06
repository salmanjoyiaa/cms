import { listPromptTemplates } from '@/lib/actions/prompts';
import { PromptsClient } from '@/components/prompts/prompts-client';

export default async function PromptsPage() {
  const templates = await listPromptTemplates();
  return <PromptsClient templates={templates} />;
}
