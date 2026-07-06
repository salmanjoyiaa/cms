import type { ContentProjectStatus } from '@/lib/types/database';

const VALID_TRANSITIONS: Record<ContentProjectStatus, ContentProjectStatus[]> = {
  idea: ['researched', 'brief_pending_approval', 'archived'],
  researched: ['brief_pending_approval', 'archived'],
  brief_pending_approval: ['brief_approved', 'archived', 'brief_pending_approval'],
  brief_approved: ['script_pending_approval', 'archived'],
  script_pending_approval: ['script_approved', 'archived', 'script_pending_approval'],
  script_approved: ['assets_pending_approval', 'archived'],
  assets_pending_approval: ['assets_approved', 'archived', 'assets_pending_approval'],
  assets_approved: ['render_pending', 'ready_to_publish', 'archived'],
  render_pending: ['ready_to_publish', 'failed', 'archived'],
  ready_to_publish: ['scheduled', 'published', 'archived'],
  scheduled: ['published', 'failed', 'archived'],
  published: ['archived'],
  failed: ['ready_to_publish', 'scheduled', 'archived'],
  archived: [],
};

export function canTransition(from: ContentProjectStatus, to: ContentProjectStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getStatusLabel(status: ContentProjectStatus): string {
  const labels: Record<ContentProjectStatus, string> = {
    idea: 'Idea',
    researched: 'Researched',
    brief_pending_approval: 'Brief Pending',
    brief_approved: 'Brief Approved',
    script_pending_approval: 'Script Pending',
    script_approved: 'Script Approved',
    assets_pending_approval: 'Assets Pending',
    assets_approved: 'Assets Approved',
    render_pending: 'Rendering',
    ready_to_publish: 'Ready to Publish',
    scheduled: 'Scheduled',
    published: 'Published',
    failed: 'Failed',
    archived: 'Archived',
  };
  return labels[status] ?? status;
}

export function getStatusColor(status: ContentProjectStatus): string {
  if (status.includes('pending')) return 'bg-amber-500/20 text-amber-400';
  if (status.includes('approved') || status === 'published') return 'bg-emerald-500/20 text-emerald-400';
  if (status === 'failed') return 'bg-red-500/20 text-red-400';
  if (status === 'archived') return 'bg-zinc-500/20 text-zinc-400';
  return 'bg-violet-500/20 text-violet-400';
}

export const PIPELINE_COLUMNS: ContentProjectStatus[] = [
  'idea',
  'brief_pending_approval',
  'script_pending_approval',
  'assets_pending_approval',
  'render_pending',
  'ready_to_publish',
  'scheduled',
  'published',
];

export const APPROVAL_STATUS_MAP: Partial<Record<ContentProjectStatus, ContentProjectStatus>> = {
  brief_pending_approval: 'brief_approved',
  script_pending_approval: 'script_approved',
  assets_pending_approval: 'assets_approved',
};

export const POST_APPROVAL_STATUS_MAP: Partial<Record<ContentProjectStatus, ContentProjectStatus>> = {
  script_approved: 'assets_pending_approval',
};

export const REJECTION_STATUS_MAP: Partial<Record<ContentProjectStatus, ContentProjectStatus>> = {
  brief_pending_approval: 'idea',
  script_pending_approval: 'brief_approved',
  assets_pending_approval: 'script_approved',
};

export const REGENERATE_STATUS_MAP: Partial<Record<ContentProjectStatus, ContentProjectStatus>> = {
  brief_pending_approval: 'brief_pending_approval',
  script_pending_approval: 'script_pending_approval',
  assets_pending_approval: 'assets_pending_approval',
};
