import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NewContentForm } from '@/components/content/new-content-form';
import { listChannels } from '@/lib/actions/channels';

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  const channels = await listChannels();

  return (
    <div>
      <PageHeader title="New Content Project" description="Start a new piece of content from an idea or topic.">
        <Button variant="outline" asChild>
          <Link href="/dashboard/content">Cancel</Link>
        </Button>
      </PageHeader>

      <Card className="glass-card max-w-2xl">
        <CardContent className="pt-6">
          <NewContentForm channels={channels} defaultTopic={topic} />
        </CardContent>
      </Card>
    </div>
  );
}
