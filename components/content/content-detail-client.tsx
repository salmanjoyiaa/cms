'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Send, CalendarClock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/form-select';
import { ApprovalPanel } from '@/components/approval/approval-panel';
import { PageHeader } from '@/components/dashboard/page-header';
import { getStatusLabel, getStatusColor } from '@/lib/content/status-machine';
import {
  generateBrief,
  generateScriptAction,
  generateBlogAction,
  generateCaptionsAction,
  generateStoryboardAction,
} from '@/lib/actions/ai';
import { publishBlogPost, addToPublishQueue } from '@/lib/actions/publishing';
import { updateBrief, updateScript } from '@/lib/actions/publishing';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import type {
  ContentProject,
  ContentBrief,
  Script,
  BlogPost,
  ApprovalStep,
  VideoStoryboard,
  Asset,
  ContentProjectStatus,
  PlatformType,
  PublishMode,
} from '@/lib/types/database';

const PLATFORM_OPTIONS = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'blog', label: 'Blog' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'facebook', label: 'Facebook' },
];

const PUBLISH_MODE_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'semi_auto', label: 'Semi-auto' },
  { value: 'auto', label: 'Auto' },
];

interface ContentDetailClientProps {
  project: ContentProject;
  brief: ContentBrief | null;
  script: Script | null;
  blog: BlogPost | null;
  storyboard: VideoStoryboard | null;
  assets: Asset[];
  approvals: ApprovalStep[];
}

export function ContentDetailClient({
  project,
  brief,
  script,
  blog,
  storyboard,
  assets,
  approvals,
}: ContentDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [publishPlatform, setPublishPlatform] = useState<PlatformType>(
    (project.suggested_platform as PlatformType) ?? 'blog'
  );
  const [publishMode, setPublishMode] = useState<PublishMode>('manual');

  const status = project.status as ContentProjectStatus;

  const runGenerate = (fn: () => Promise<{ error?: string; success?: boolean }>, successMsg = 'Generated successfully') => {
    startTransition(async () => {
      const result = await fn();
      if (result.error) toast.error(result.error);
      else {
        toast.success(successMsg);
        router.refresh();
      }
    });
  };

  const canGenerateBrief = ['idea', 'researched', 'brief_pending_approval'].includes(status);
  const canGenerateScript = ['brief_approved', 'script_pending_approval'].includes(status);
  const canGenerateStoryboard = ['script_approved', 'assets_pending_approval', 'assets_approved'].includes(status);
  const canPublish = ['assets_approved', 'ready_to_publish', 'scheduled'].includes(status) || Boolean(blog);

  const canApproveBrief = status === 'brief_pending_approval';
  const canApproveScript = status === 'script_pending_approval';
  const canApproveAssets = status === 'assets_pending_approval';

  function handleAddToQueue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('content_project_id', project.id);
    startTransition(async () => {
      const result = await addToPublishQueue(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success('Added to publish queue');
        router.refresh();
      }
    });
  }

  return (
    <div>
      <PageHeader title={project.title} description={project.topic ?? undefined}>
        <Badge className={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Badge>
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="glass-card flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="brief">Brief</TabsTrigger>
          <TabsTrigger value="script">Script</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="storyboard">Storyboard</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Project Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Topic:</span> {project.topic ?? '—'}</p>
              <p><span className="text-muted-foreground">Platform:</span> {project.suggested_platform ?? '—'}</p>
              <p><span className="text-muted-foreground">Language:</span> {project.suggested_language}</p>
              <p><span className="text-muted-foreground">Format:</span> {project.suggested_format ?? '—'}</p>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => runGenerate(() => generateBrief(project.id))}
              disabled={isPending || !canGenerateBrief}
              title={!canGenerateBrief ? 'Brief generation not available at this stage' : undefined}
            >
              <Sparkles className="h-4 w-4 mr-1" /> Generate Brief
            </Button>
            <Button
              onClick={() => runGenerate(() => generateScriptAction(project.id))}
              disabled={isPending || !canGenerateScript}
              variant="outline"
              title={!canGenerateScript ? 'Approve the brief first' : undefined}
            >
              <Sparkles className="h-4 w-4 mr-1" /> Generate Script
            </Button>
            <Button
              onClick={() => runGenerate(() => generateBlogAction(project.id))}
              disabled={isPending}
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-1" /> Generate Blog
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="brief" className="space-y-4">
          {canApproveBrief && (
            <ApprovalPanel
              contentProjectId={project.id}
              currentStatus={status}
              canApprove={canApproveBrief}
              stepLabel="Content Brief"
              onRegenerate={async () => { await generateBrief(project.id); }}
              approvals={approvals}
            />
          )}
          {brief ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">{brief.title} <Badge variant="outline">v{brief.version}</Badge></CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{brief.summary}</p>
                <div>
                  <p className="text-sm font-medium mb-2">Key Points</p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {(brief.key_points as string[]).map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
                <Textarea
                  defaultValue={brief.summary ?? ''}
                  onBlur={(e) => updateBrief(project.id, { summary: e.target.value })}
                  rows={4}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card p-8 text-center text-muted-foreground">
              No brief yet. Click &quot;Generate Brief&quot; to create one with AI.
              <div className="mt-4">
                <Button onClick={() => runGenerate(() => generateBrief(project.id))} disabled={isPending || !canGenerateBrief}>
                  <Sparkles className="h-4 w-4 mr-1" /> Generate Brief
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="script" className="space-y-4">
          {canApproveScript && (
            <ApprovalPanel
              contentProjectId={project.id}
              currentStatus={status}
              canApprove={canApproveScript}
              stepLabel="Script"
              onRegenerate={async () => { await generateScriptAction(project.id); }}
              approvals={approvals}
            />
          )}
          {script ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">Script <Badge variant="outline">v{script.version}</Badge></CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-violet-400">Hook</p>
                  <p className="text-sm">{script.hook}</p>
                </div>
                <Textarea
                  defaultValue={script.script_body ?? ''}
                  onBlur={(e) => updateScript(project.id, { script_body: e.target.value })}
                  rows={8}
                />
                <div className="flex gap-2">
                  {['youtube', 'tiktok', 'instagram'].map((platform) => (
                    <Button
                      key={platform}
                      size="sm"
                      variant="outline"
                      onClick={() => runGenerate(() => generateCaptionsAction(project.id, platform))}
                      disabled={isPending}
                    >
                      Caption for {platform}
                    </Button>
                  ))}
                </div>
                {script.caption && (
                  <div>
                    <p className="text-sm font-medium">Caption</p>
                    <p className="text-sm text-muted-foreground">{script.caption}</p>
                  </div>
                )}
                {script.hashtags && (script.hashtags as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(script.hashtags as string[]).map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card p-8 text-center text-muted-foreground">
              No script yet.
              <div className="mt-4">
                <Button
                  onClick={() => runGenerate(() => generateScriptAction(project.id))}
                  disabled={isPending || !canGenerateScript}
                >
                  <Sparkles className="h-4 w-4 mr-1" /> Generate Script
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          {canApproveAssets && (
            <ApprovalPanel
              contentProjectId={project.id}
              currentStatus={status}
              canApprove={canApproveAssets}
              stepLabel="Assets"
              onRegenerate={async () => { await generateStoryboardAction(project.id); }}
              approvals={approvals}
            />
          )}
          {assets.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {assets.map((asset) => (
                <Card key={asset.id} className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base capitalize">{asset.type}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Name:</span> {asset.name}</p>
                    <p><span className="text-muted-foreground">Status:</span> {asset.status}</p>
                    {asset.public_url && (
                      <a href={asset.public_url} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                        View asset
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card p-8 text-center text-muted-foreground">
              {status === 'assets_pending_approval'
                ? 'Review generated assets (storyboard, thumbnails, etc.) and approve to continue.'
                : 'Assets will appear here after script approval and generation.'}
              {canGenerateStoryboard && (
                <div className="mt-4">
                  <Button
                    onClick={() => runGenerate(() => generateStoryboardAction(project.id))}
                    disabled={isPending}
                  >
                    <Sparkles className="h-4 w-4 mr-1" /> Generate Storyboard
                  </Button>
                </div>
              )}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="blog" className="space-y-4">
          {blog ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">{blog.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">/{blog.slug} · {blog.status}</p>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{blog.content ?? ''}</ReactMarkdown>
                </div>
                {blog.status !== 'published' && (
                  <Button
                    onClick={() => runGenerate(() => publishBlogPost(project.id), 'Published to blog')}
                    disabled={isPending}
                    className="bg-gradient-to-r from-violet-600 to-cyan-500"
                  >
                    <Send className="h-4 w-4 mr-1" /> Publish to Blog
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card p-8 text-center text-muted-foreground">
              No blog post yet.
              <div className="mt-4">
                <Button onClick={() => runGenerate(() => generateBlogAction(project.id))} disabled={isPending}>
                  <Sparkles className="h-4 w-4 mr-1" /> Generate Blog Post
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="storyboard" className="space-y-4">
          {storyboard ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">Storyboard v{storyboard.version}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(storyboard.scenes as Array<{ scene_number: number; duration_seconds: number; visual_description: string; narration: string }>).map((scene) => (
                  <div key={scene.scene_number} className="p-3 rounded-lg border border-white/5">
                    <p className="text-sm font-medium">Scene {scene.scene_number} · {scene.duration_seconds}s</p>
                    <p className="text-sm text-muted-foreground mt-1">{scene.visual_description}</p>
                    <p className="text-sm mt-1 italic">{scene.narration}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card p-8 text-center text-muted-foreground">
              Generate a storyboard from your approved script.
              <div className="mt-4">
                <Button
                  onClick={() => runGenerate(() => generateStoryboardAction(project.id))}
                  disabled={isPending || !canGenerateStoryboard}
                >
                  <Sparkles className="h-4 w-4 mr-1" /> Generate Storyboard
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="publish" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Add to Publish Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!canPublish && !blog ? (
                <p className="text-sm text-muted-foreground">
                  Approve assets and generate content before publishing. Blog posts can be queued once generated.
                </p>
              ) : (
                <form onSubmit={handleAddToQueue} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <FormSelect
                      name="platform"
                      value={publishPlatform}
                      onValueChange={(v) => setPublishPlatform(v as PlatformType)}
                      options={PLATFORM_OPTIONS}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Publish Mode</Label>
                    <FormSelect
                      name="publish_mode"
                      value={publishMode}
                      onValueChange={(v) => setPublishMode(v as PublishMode)}
                      options={PUBLISH_MODE_OPTIONS}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Schedule (optional)</Label>
                    <Input name="scheduled_at" type="datetime-local" />
                  </div>
                  <Button type="submit" disabled={isPending} className="bg-gradient-to-r from-violet-600 to-cyan-500">
                    {isPending ? 'Adding...' : 'Add to Queue'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Approval History</CardTitle></CardHeader>
            <CardContent>
              {approvals.length === 0 ? (
                <p className="text-muted-foreground text-sm">No approval steps recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {approvals.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 text-sm p-3 rounded-lg border border-white/5">
                      <Badge variant="outline">{a.status}</Badge>
                      <span>{a.step_type}</span>
                      {a.notes && <span className="text-muted-foreground">— {a.notes}</span>}
                      {a.approved_at && (
                        <span className="text-muted-foreground ml-auto">
                          {new Date(a.approved_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
