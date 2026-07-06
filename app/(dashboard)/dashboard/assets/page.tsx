import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { listAssets } from '@/lib/actions/publishing';

export default async function AssetsPage() {
  const assets = await listAssets();

  return (
    <div>
      <PageHeader title="Asset Library" description="Manage generated and uploaded images, audio, and video assets." />

      {assets.length === 0 ? (
        <EmptyState
          title="No assets yet"
          description="Assets are created during content generation or uploaded from content project pages."
          actionLabel="View Content"
          actionHref="/dashboard/content"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset.id} className="glass-card">
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-base">{asset.name}</CardTitle>
                  <Badge variant="outline">{asset.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Badge variant="secondary">{asset.status}</Badge>
                {asset.content_projects?.title && (
                  <p className="text-muted-foreground">
                    Project: {asset.content_projects.title}
                  </p>
                )}
                {asset.public_url && (
                  <Link href={asset.public_url} className="text-violet-400 hover:underline text-xs" target="_blank">
                    View asset
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
