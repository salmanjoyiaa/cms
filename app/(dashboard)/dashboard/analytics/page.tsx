import { getAnalyticsSummary } from '@/lib/actions/publishing';
import { AnalyticsClient } from '@/components/analytics/analytics-client';

export default async function AnalyticsPage() {
  const snapshots = await getAnalyticsSummary();
  return <AnalyticsClient snapshots={snapshots} />;
}
