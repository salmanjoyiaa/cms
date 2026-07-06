import { createAdminClient } from '@/lib/supabase/admin';

export interface RenderJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputPath?: string;
  error?: string;
}

export async function enqueueRender(params: {
  contentProjectId: string;
  workspaceId: string;
  storyboardId: string;
}): Promise<RenderJob> {
  const admin = createAdminClient();

  await admin
    .from('video_storyboards')
    .update({ render_status: 'processing' })
    .eq('id', params.storyboardId);

  await admin
    .from('content_projects')
    .update({ status: 'render_pending' })
    .eq('id', params.contentProjectId);

  // FFmpeg/Remotion placeholder — replace with real render pipeline
  const placeholderPath = `renders/${params.workspaceId}/${params.contentProjectId}/output.mp4`;

  await admin
    .from('video_storyboards')
    .update({
      render_status: 'completed',
      render_output_path: placeholderPath,
    })
    .eq('id', params.storyboardId);

  await admin
    .from('content_projects')
    .update({ status: 'ready_to_publish' })
    .eq('id', params.contentProjectId);

  return {
    id: params.storyboardId,
    status: 'completed',
    outputPath: placeholderPath,
  };
}

export async function getRenderStatus(storyboardId: string): Promise<RenderJob> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('video_storyboards')
    .select('id, render_status, render_output_path')
    .eq('id', storyboardId)
    .single();

  return {
    id: storyboardId,
    status: (data?.render_status as RenderJob['status']) ?? 'pending',
    outputPath: data?.render_output_path ?? undefined,
  };
}
