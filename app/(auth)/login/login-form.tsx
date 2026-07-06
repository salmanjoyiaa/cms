'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from '@/lib/actions/auth';

const ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: 'Authentication failed. Please try signing in again.',
};

const INFO_MESSAGES: Record<string, string> = {
  confirm_email: 'Check your email to confirm your account, then sign in.',
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const queryError = searchParams.get('error');
  const queryMessage = searchParams.get('message');
  const bannerError = queryError ? ERROR_MESSAGES[queryError] ?? queryError : null;
  const bannerInfo = queryMessage ? INFO_MESSAGES[queryMessage] ?? queryMessage : null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="glass-card w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 mb-2">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your ContentMS command center</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {bannerInfo && <p className="text-sm text-amber-400">{bannerInfo}</p>}
            {(bannerError || error) && (
              <p className="text-sm text-destructive">{bannerError ?? error}</p>
            )}
            <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-cyan-500" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            No account?{' '}
            <Link href="/signup" className="text-violet-400 hover:underline">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
