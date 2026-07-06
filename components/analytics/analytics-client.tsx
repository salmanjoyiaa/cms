'use client';

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { AnalyticsSnapshot } from '@/lib/types/database';

export function AnalyticsClient({ snapshots }: { snapshots: AnalyticsSnapshot[] }) {
  const chartData = snapshots.map((s) => ({
    date: s.snapshot_date,
    views: Number(s.views),
    likes: Number(s.likes),
    shares: Number(s.shares),
  }));

  return (
    <div>
      <PageHeader title="Analytics" description="Track content performance across platforms." />

      {snapshots.length === 0 ? (
        <Card className="glass-card p-12 text-center text-muted-foreground">
          No analytics data yet. Analytics sync runs via cron when platform integrations are connected.
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Views Over Time</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ views: { label: 'Views', color: '#8b5cf6' } }} className="h-[300px]">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} />
                  <YAxis stroke="#a1a1aa" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="views" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-sm text-muted-foreground">Best Hooks</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Placeholder — populated by AI learning loop</p></CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-sm text-muted-foreground">Best Topics</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Placeholder — populated by AI learning loop</p></CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-sm text-muted-foreground">Best Posting Times</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Placeholder — populated by AI learning loop</p></CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
