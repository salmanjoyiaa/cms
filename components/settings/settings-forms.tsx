'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile, updateWorkspaceName } from '@/lib/actions/auth';
import { toast } from 'sonner';

export function ProfileForm({
  defaultFullName,
  email,
}: {
  defaultFullName: string;
  email: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) toast.error(result.error);
      else toast.success('Profile saved');
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input name="fullName" defaultValue={defaultFullName} />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={email} disabled />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  );
}

export function WorkspaceForm({
  workspaceId,
  defaultName,
}: {
  workspaceId: string;
  defaultName: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateWorkspaceName(formData);
      if (result.error) toast.error(result.error);
      else toast.success('Workspace saved');
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <div className="space-y-2">
        <Label>Workspace Name</Label>
        <Input name="name" defaultValue={defaultName} />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save Workspace'}
      </Button>
    </form>
  );
}
