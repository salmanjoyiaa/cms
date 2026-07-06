import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signOut } from '@/lib/actions/auth';

export function SetupErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="glass-card max-w-md w-full">
        <CardHeader>
          <CardTitle>Workspace setup failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Your account is signed in, but we could not create or load your workspace.
            This usually means database permissions or migrations need to be applied.
          </p>
          <div className="flex flex-col gap-2">
            <form action={signOut}>
              <Button type="submit" variant="outline" className="w-full">
                Sign out and try again
              </Button>
            </form>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
