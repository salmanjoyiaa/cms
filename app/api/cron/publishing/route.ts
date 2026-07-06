import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { blogService } from '@/lib/publishing/blog';
import type { PublishQueueItem } from '@/lib/types/database';

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
  const now = new Date().toISOString();

  const { data: queue } = await admin
    .from('publish_queue')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now);

  let processed = 0;
  let skipped = 0;

  const items = (queue ?? []) as PublishQueueItem[];

  for (const item of items) {
    if (item.publish_mode !== 'auto') {
      skipped++;
      continue;
    }

    const { data: approval } = await admin
      .from('approval_steps')
      .select('status')
      .eq('content_project_id', item.content_project_id)
      .eq('step_type', 'publish')
      .eq('status', 'approved')
      .limit(1)
      .single();

    if (!approval) {
      skipped++;
      continue;
    }

    if (item.platform === 'blog') {
      const { data: blogPost } = await admin
        .from('blog_posts')
        .select('*')
        .eq('content_project_id', item.content_project_id)
        .single();

      if (blogPost) {
        const post = blogPost as { id: string; slug: string };
        await blogService.publishNow({ blogPostId: post.id, slug: post.slug });
        await admin.from('publish_queue').update({
          status: 'published',
          published_at: now,
        }).eq('id', item.id);
        processed++;
      }
    } else {
      skipped++;
    }
  }

  return NextResponse.json({ success: true, processed, skipped });
}
