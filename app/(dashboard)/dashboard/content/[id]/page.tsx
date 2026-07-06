import { notFound } from 'next/navigation';
import { getContentDetails } from '@/lib/actions/publishing';
import { ContentDetailClient } from '@/components/content/content-detail-client';

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const details = await getContentDetails(id);

  if (!details?.project) notFound();

  return (
    <ContentDetailClient
      project={details.project as never}
      brief={details.brief as never}
      script={details.script as never}
      blog={details.blog as never}
      storyboard={details.storyboard as never}
      assets={details.assets as never}
      approvals={details.approvals as never}
    />
  );
}
