import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recommendNextContent } from '@/lib/ai/recommendations';

function verifyCron(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!verifyCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: workspaces } = await admin.from('workspaces').select('id').limit(100);

  const results = [];
  for (const ws of workspaces ?? []) {
    try {
      const recommendations = await recommendNextContent(ws.id);
      results.push({ workspaceId: ws.id, recommendations });
    } catch {
      results.push({ workspaceId: ws.id, error: 'Skipped — no AI credentials' });
    }
  }

  return NextResponse.json({ success: true, results });
}
