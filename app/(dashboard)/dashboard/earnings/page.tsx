import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Video, Share2, Camera } from 'lucide-react';
import { getMonetizationSummary } from '@/lib/actions/publishing';

export default async function EarningsPage() {
  const snapshots = await getMonetizationSummary();

  const totals = snapshots.reduce(
    (acc, s) => ({
      adsense: acc.adsense + Number(s.adsense_earnings),
      youtube: acc.youtube + Number(s.youtube_earnings),
      facebook: acc.facebook + Number(s.facebook_earnings),
      instagram: acc.instagram + Number(s.instagram_earnings),
    }),
    { adsense: 0, youtube: 0, facebook: 0, instagram: 0 }
  );

  return (
    <div>
      <PageHeader
        title="Earnings"
        description="Track monetization across AdSense, YouTube, and social platforms."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="AdSense" value={`$${totals.adsense.toFixed(2)}`} icon={DollarSign} description="Placeholder until connected" />
        <StatCard title="YouTube" value={`$${totals.youtube.toFixed(2)}`} icon={Video} description="Placeholder until connected" />
        <StatCard title="Facebook" value={`$${totals.facebook.toFixed(2)}`} icon={Share2} description="Placeholder until connected" />
        <StatCard title="Instagram" value={`$${totals.instagram.toFixed(2)}`} icon={Camera} description="Placeholder until connected" />
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base">Monetization Notes</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Connect Google AdSense and YouTube in Settings &gt; Integrations to sync earnings.</p>
          <p>Facebook and Instagram performance metrics require OAuth app review for production access.</p>
        </CardContent>
      </Card>
    </div>
  );
}
