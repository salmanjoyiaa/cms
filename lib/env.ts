import { z } from 'zod';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export function getPublicEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getMissingEnvMessage(): string | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return 'NEXT_PUBLIC_SUPABASE_URL is not configured. Copy .env.example to .env.local and add your Supabase credentials.';
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return 'NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.';
  }
  return null;
}
