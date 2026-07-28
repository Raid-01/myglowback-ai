'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    try {
      const res = await signIn('credentials', {
        email: form.get('email'),
        password: form.get('password'),
        redirect: false,
      });

      setLoading(false);
      if (res?.ok) {
        router.push('/dashboard');
      } else if (res?.error === 'CLINIC_INACTIVE') {
        setError('This clinic\u2019s subscription has expired. Contact your Clinic Admin to renew.');
      } else {
        setError('Incorrect email or password.');
      }
    } catch {
      setLoading(false);
      setError('Could not reach the server. Check your connection and try again.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory-100 px-6">
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-medium text-clinical-text">Log in</h1>
        <p className="mt-1 text-sm text-clinical-muted">Welcome back to MyGlowBack.AI.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-clinical-muted">
          <span className="h-px flex-1 bg-clinical-border" />
          or
          <span className="h-px flex-1 bg-clinical-border" />
        </div>

        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        >
          Continue with Google
        </Button>

        <p className="mt-5 text-center text-sm text-clinical-muted">
          Setting up a new clinic?{' '}
          <Link href="/signup" className="font-medium text-sage-700">
            Start free trial
          </Link>
        </p>
      </Card>
    </main>
  );
}
