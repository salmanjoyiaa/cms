import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  return NextResponse.json({
    error: 'OAuth flow not yet implemented — placeholder',
    provider,
    message: `To connect ${provider}, implement OAuth 2.0 flow with required scopes. App review may be required for production API access.`,
    status: 'not_connected',
  }, { status: 501 });
}
