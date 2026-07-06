import Link from 'next/link';
import { FileText, Plus, Radio, Search } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getContentStats, getPendingApprovals, listContentProjects } from '@/lib/actions/content';
import { getStatusLabel, getStatusColor } from '@/lib/content/status-machine';

export default async function DashboardPage() {
  const [stats, pending, recent] = await Promise.all([
    getContentStats(),
    getPendingApprovals(),
    listContentProjects(),
  ]);

  const totalProjects = Object.values(stats).reduce((a, b) => a + b, 0);
  const pendingCount = pending.length;

  return (
    <div>
      <PageHeader
        title="Command Center"
        description="Your AI content automation hub — human approval at every step."
      >
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/channels?create=1">
            <Radio className="h-4 w-4 mr-1" />
            New Channel
          </Link>
        </Button>
        <Button asChild size="sm" className="bg-gradient-to-r from-violet-600 to-cyan-500">
          <Link href="/dashboard/content/new">
            <Plus className="h-4 w-4 mr-1" />
            New Content
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Projects" value={totalProjects} icon={FileText} />
        <StatCard title="Pending Approvals" value={pendingCount} description="Requires your review" />
        <StatCard title="Published" value={stats.published ?? 0} />
        <StatCard title="In Pipeline" value={(stats.brief_pending_approval ?? 0) + (stats.script_pending_approval ?? 0) + (stats.assets_pending_approval ?? 0)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending approvals — you&apos;re all caught up.</p>
            ) : (
              <div className="space-y-3">
                {pending.map((item) => (
                  <Link
                    key={item.id}
                    href={`/dashboard/content/${item.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium text-sm">{item.title}</span>
                    <Badge className={getStatusColor(item.status as never)}>
                      {getStatusLabel(item.status as never)}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Recent Content</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.slice(0, 5).length === 0 ? (
              <p className="text-sm text-muted-foreground">No content yet. Create your first project.</p>
            ) : (
              <div className="space-y-3">
                {recent.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    href={`/dashboard/content/${item.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium text-sm">{item.title}</span>
                    <Badge variant="outline">{getStatusLabel(item.status as never)}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="glass-card border-violet-500/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4 text-violet-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/research">Research Trends</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/publishing">Publishing Queue</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
