import { createAdminClient } from '@/lib/supabase/admin';
import type { AuditAction } from '@/lib/types/database';

const AUDIT_TABLE = 'cms_audit_logs';

export async function logAudit(params: {
  workspaceId: string;
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
}) {
  try {
    const admin = createAdminClient();
    await admin.from(AUDIT_TABLE).insert({
      workspace_id: params.workspaceId,
      user_id: params.userId ?? null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      details: params.details ?? {},
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[audit] Failed to log audit event:', error);
    }
  }
}
