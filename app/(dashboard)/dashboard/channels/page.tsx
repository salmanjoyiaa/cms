import { listChannels } from '@/lib/actions/channels';
import { ChannelsClient } from '@/components/channels/channels-client';

export default async function ChannelsPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>;
}) {
  const { create } = await searchParams;
  const channels = await listChannels();
  return <ChannelsClient channels={channels} autoOpenCreate={create === '1'} />;
}
