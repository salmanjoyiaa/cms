import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { PublishingService, PublishResult } from './types';

export const blogService: PublishingService = {
  platform: 'blog',

  async validateConnection() {
    return true;
  },

  async createDraft(metadata: Record<string, unknown>) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('blog_posts')
      .insert({
        workspace_id: metadata.workspaceId as string,
        content_project_id: metadata.contentProjectId as string,
        slug: metadata.slug as string,
        title: metadata.title as string,
        content: metadata.content as string,
        status: 'draft',
      })
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, platformPostId: data.id };
  },

  async publishNow(metadata: Record<string, unknown>): Promise<PublishResult> {
    const admin = createAdminClient();
    const blogPostId = metadata.blogPostId as string;
    const slug = metadata.slug as string;

    const { error } = await admin
      .from('blog_posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', blogPostId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);

    return {
      success: true,
      platformPostId: blogPostId,
      platformUrl: `/blog/${slug}`,
    };
  },

  async schedulePost(metadata, scheduledAt) {
    const admin = createAdminClient();
    const { error } = await admin
      .from('blog_posts')
      .update({ status: 'scheduled' })
      .eq('id', metadata.blogPostId as string);

    if (error) return { success: false, error: error.message };
    return { success: true, platformPostId: metadata.blogPostId as string };
  },

  async getAnalytics(postId) {
    const admin = createAdminClient();
    const { data } = await admin
      .from('analytics_snapshots')
      .select('blog_page_views, views')
      .eq('content_project_id', postId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    return {
      views: data?.blog_page_views ?? data?.views ?? 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      watchTimeSeconds: 0,
    };
  },
};
