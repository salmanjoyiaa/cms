import { listTrendResearch } from '@/lib/actions/publishing';
import { ResearchClient } from '@/components/research/research-client';

export default async function ResearchPage() {
  const topics = await listTrendResearch();
  return <ResearchClient topics={topics} />;
}
