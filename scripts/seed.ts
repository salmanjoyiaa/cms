/**
 * Seed script for local development.
 * Run after applying migrations: npx tsx scripts/seed.ts
 *
 * Note: System prompt templates are seeded via supabase/seed.sql
 * This script adds sample analytics placeholders for dashboard demos.
 */

async function seed() {
  console.log('Seed data is applied via supabase/seed.sql during db reset.');
  console.log('To seed locally:');
  console.log('  1. Create a Supabase project at https://supabase.com');
  console.log('  2. Link project: npx supabase link --project-ref YOUR_REF');
  console.log('  3. Push migrations: npx supabase db push');
  console.log('  4. Run seed SQL: npx supabase db execute -f supabase/seed.sql');
  console.log('');
  console.log('Sign up via the app UI to create your workspace automatically.');
}

seed().catch(console.error);
