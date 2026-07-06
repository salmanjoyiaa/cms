# ContentMS — AI Content Automation Command Center

Production-ready MVP foundation for AI-powered content automation: research viral topics, generate blog posts and video scripts, manage human approval at every step, and publish to multiple platforms.

**Repository:** [github.com/salmanjoyiaa/cms](https://github.com/salmanjoyiaa/cms)

## Tech Stack

- **Next.js 16** App Router + TypeScript
- **Tailwind CSS v4** + shadcn/ui (dark cinematic SaaS theme)
- **Supabase** Auth, Postgres, Storage, RLS
- **Groq** as the first live AI provider (others stubbed behind abstraction layer)
- **Vercel** deployment with cron-ready API routes

## Features

- Multi-workspace tenancy with RLS
- Content pipeline with human-in-the-loop approval at every step
- Channel manager, research board, prompt templates
- AI generation: briefs, scripts, blog posts, captions, hashtags, storyboards
- Blog CMS with ISR public pages at `/blog`
- Publishing queue with manual/semi-auto/auto modes
- Integration settings for 16+ providers (API key + OAuth placeholders)
- Analytics, earnings, and AI recommendation placeholders
- FFmpeg/Remotion-ready video render architecture

## Quick Start

### 1. Clone and install

```bash
cd contentms
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy Project URL and anon key from Settings > API
3. Copy service role key (keep secret — server only)

### 3. Apply database migrations

Install Supabase CLI, then:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Or paste migration files from `supabase/migrations/` into the Supabase SQL Editor in order.

**Via Supabase MCP (Cursor):** If you have the Supabase MCP server linked to your project, apply each migration with `apply_migration` (one file per call, in order), then run `supabase/seed.sql` via `execute_sql`. Run `get_advisors` with type `security` to verify RLS policies.

Run seed data:

```bash
# Via SQL Editor: paste contents of supabase/seed.sql
```

### 4. Configure environment

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `CREDENTIALS_ENCRYPTION_KEY` | 32-byte hex: `openssl rand -hex 32` |
| `CRON_SECRET` | Random string for Vercel cron auth |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

**Never commit `.env.local`** — it is gitignored. Commit `.env.example` as a template.

### Auth redirect URLs (Supabase Dashboard)

In **Authentication → URL Configuration**, set:

- **Site URL:** `http://localhost:3000` (or your production URL)
- **Redirect URLs:** `http://localhost:3000/auth/callback`

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and configure Groq API key in Settings.

### 6. Deploy to Vercel

```bash
npx vercel
```

Add all environment variables in Vercel project settings.

## Groq API Setup

1. Get an API key at [console.groq.com](https://console.groq.com)
2. Go to Dashboard > Settings > Integrations
3. Enter Groq API key — stored encrypted in Supabase, never exposed to browser
4. Click Test Connection

## Cron Jobs

Cron routes require `Authorization: Bearer ${CRON_SECRET}` header.

| Route | Schedule (example) | Purpose |
|-------|-------------------|---------|
| `/api/cron/publishing` | `0 6 * * *` | Process scheduled queue (daily at 6:00 UTC) |
| `/api/cron/research` | `0 7 * * *` | Auto-research active channels |
| `/api/cron/analytics` | `0 8 * * *` | Sync platform analytics |
| `/api/cron/recommendations` | `0 8 * * 1` | Weekly AI recommendations |

**Vercel Hobby limit:** Cron jobs may run at most **once per day**. The included [`vercel.json`](vercel.json) uses `0 6 * * *` for publishing so Hobby deployments succeed. Sub-daily schedules (e.g. every 15 minutes) require **Vercel Pro** or manual triggers.

**Crons are disabled by default** until `CRON_SECRET` is set. To trigger publishing manually on Hobby:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.vercel.app/api/cron/publishing
```

On **Vercel Pro**, you can add more frequent crons in the dashboard or `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/publishing", "schedule": "0 6 * * *" },
    { "path": "/api/cron/research", "schedule": "0 7 * * *" },
    { "path": "/api/cron/analytics", "schedule": "0 8 * * *" },
    { "path": "/api/cron/recommendations", "schedule": "0 8 * * 1" }
  ]
}
```

## Security

- RLS enabled on all tables — users only access their workspace data
- API keys encrypted with AES-256-GCM via `CREDENTIALS_ENCRYPTION_KEY`
- Service role key and encryption key never sent to browser
- Auto-publish requires approved publish step AND `publish_mode = auto`
- Audit logs for approvals, rejections, regenerations, credential updates, publish attempts

## Project Structure

```
app/
  (auth)/          Login, signup
  (dashboard)/     Protected dashboard modules
  blog/            Public ISR blog pages
  api/cron/        Vercel cron endpoints
  api/oauth/       OAuth placeholders
components/        UI, dashboard, approval, settings
lib/
  ai/              Provider abstraction (Groq live, others stubbed)
  publishing/      Platform publish services
  actions/         Server actions
  supabase/        SSR clients
  crypto/          Credential encryption
supabase/
  migrations/      9 ordered SQL migrations
  seed.sql         System prompt templates
```

## Content Pipeline

```
idea → researched → brief_pending_approval → brief_approved →
script_pending_approval → script_approved → assets_pending_approval →
assets_approved → render_pending → ready_to_publish → scheduled → published
```

Every `*_pending_approval` step requires explicit human approval before proceeding.

## License

MIT
-------------------------------------------------------------