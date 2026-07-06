'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getUserWorkspace } from '@/lib/supabase/server';
import { logAudit } from '@/lib/audit';
import type { PromptCategory } from '@/lib/types/database';

export async function listPromptTemplates() {
  const ctx = await getUserWorkspace();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('prompt_templates')
    .select('*')
    .or(`workspace_id.eq.${ctx.workspaceId},is_system.eq.true`)
    .order('category');

  return data ?? [];
}

export async function createPromptTemplate(formData: FormData) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { error } = await supabase.from('prompt_templates').insert({
    workspace_id: ctx.workspaceId,
    category: formData.get('category') as PromptCategory,
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    template: formData.get('template') as string,
    is_system: false,
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard/prompts');
  return { success: true };
}

export async function updatePromptTemplate(id: string, formData: FormData) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('prompt_templates')
    .update({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      template: formData.get('template') as string,
    })
    .eq('id', id)
    .eq('workspace_id', ctx.workspaceId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/prompts');
  return { success: true };
}

export async function deletePromptTemplate(id: string) {
  const ctx = await getUserWorkspace();
  if (!ctx) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('prompt_templates')
    .delete()
    .eq('id', id)
    .eq('workspace_id', ctx.workspaceId)
    .eq('is_system', false);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/prompts');
  return { success: true };
}
