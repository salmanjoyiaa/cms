import { createAdminClient } from '@/lib/supabase/admin';
import { decryptCredential } from '@/lib/crypto/credentials';
import type { AIProvider } from '../types';
import { ProviderNotConfiguredError } from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

async function getGroqApiKey(workspaceId: string): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('integration_credentials')
    .select('encrypted_value, status')
    .eq('workspace_id', workspaceId)
    .eq('provider', 'groq')
    .single();

  if (error || !data?.encrypted_value) {
    throw new ProviderNotConfiguredError('groq');
  }

  return decryptCredential(data.encrypted_value);
}

export async function createGroqProvider(workspaceId: string): Promise<AIProvider> {
  const apiKey = await getGroqApiKey(workspaceId);

  return {
    name: 'groq',
    async chatCompletion(prompt: string, systemPrompt?: string, model?: string) {
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: 'system' as const, content: systemPrompt });
      }
      messages.push({ role: 'user' as const, content: prompt });

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model ?? DEFAULT_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Groq API error: ${response.status} ${err}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content ?? '';
    },
  };
}

export async function testGroqConnection(apiKey: string): Promise<boolean> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: 'Say "connected" in one word.' }],
      max_tokens: 10,
    }),
  });
  return response.ok;
}
