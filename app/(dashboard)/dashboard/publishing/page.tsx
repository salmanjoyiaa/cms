import { listPublishQueue } from '@/lib/actions/publishing';
import { PublishingClient } from '@/components/publishing/publishing-client';

export default async function PublishingPage() {
  const queue = await listPublishQueue();
  return <PublishingClient queue={queue} />;
}
