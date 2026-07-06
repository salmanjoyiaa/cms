import { NextResponse } from 'next/server';
import { getUserWorkspace } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const ctx = await getUserWorkspace();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { type, contentProjectId } = body;

  return NextResponse.json({
    error: 'Use server actions for AI generation',
    hint: `Call generate${type} action for project ${contentProjectId}`,
  }, { status: 400 });
}
