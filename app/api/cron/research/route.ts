import { NextResponse } from 'next/server';

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

  // Placeholder: auto-research for active channels
  return NextResponse.json({
    success: true,
    message: 'Research cron executed (placeholder)',
    processed: 0,
  });
}
