import type { AIProvider } from '../types';
import { ProviderNotConfiguredError } from '../types';

function stubProvider(name: string): AIProvider {
  return {
    name,
    async chatCompletion() {
      throw new ProviderNotConfiguredError(
        name,
        `${name} is not configured. Add API credentials in Settings > Integrations.`
      );
    },
  };
}

export const openaiProvider = stubProvider('openai');
export const geminiProvider = stubProvider('gemini');
export const anthropicProvider = stubProvider('anthropic');
export const elevenlabsProvider = stubProvider('elevenlabs');
export const replicateProvider = stubProvider('replicate');
