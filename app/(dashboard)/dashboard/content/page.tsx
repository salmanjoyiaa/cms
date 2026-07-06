import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { listContentProjects } from '@/lib/actions/content';
import { getStatusLabel, getStatusColor } from '@/lib/content/status-machine';

export default async function ContentPage() {
  const projects = await listContentProjects();

  return (
    <div>
      <PageHeader title="Content Pipeline" description="Track all content projects through the approval workflow.">
        <Button asChild className="bg-gradient-to-r from-violet-600 to-cyan-500">
          <Link href="/dashboard/content/new">
            <Plus className="h-4 w-4 mr-1" />
            New Content
          </Link>
        </Button>
      </PageHeader>

      {projects.length === 0 ? (
        <EmptyState
          title="No content projects"
          description="Start a new content project from an idea, research topic, or channel."
          actionLabel="Create Content"
          actionHref="/dashboard/content/new"
        />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id} className="cursor-pointer hover:bg-white/5">
                  <TableCell>
                    <Link href={`/dashboard/content/${project.id}`} className="font-medium hover:text-violet-400">
                      {project.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {(project.channels as { name?: string })?.name ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status as never)}>
                      {getStatusLabel(project.status as never)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
