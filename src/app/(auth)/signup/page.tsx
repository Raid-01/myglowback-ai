'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { formatNaira } from '@/lib/utils';

const PRICING = { ANNUAL: 450_000, MONTHLY: 55_000 };

export default function SignupPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'ANNUAL' | 'MONTHLY'>('ANNUAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      clinicName: form.get('clinicName'),
      clinicEmail: form.get('clinicEmail'),
      adminName: form.get('adminName'),
      adminEmail: form.get('adminEmail'),
      password: form.get('password'),
      billingCycle,
    };

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error?.formErrors?.[0] ?? body.error ?? 'Something went wrong.');
      setLoading(false);
      return;
    }

    const signInRes = await signIn('credentials', {
      email: payload.adminEmail,
      password: payload.password,
      redirect: false,
    });

    setLoading(false);
    if (signInRes?.ok) {
      router.push('/dashboard/billing?welcome=1');
    } else {
      router.push('/login');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory-100 px-6 py-16">
      <Card className="w-full max-w-lg">
        <h1 className="font-display text-2xl font-medium text-clinical-text">
          Set up your clinic
        </h1>
        <p className="mt-1 text-sm text-clinical-muted">
          You&apos;ll be the Clinic Admin — you can add staff and locations after.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="clinicName">Clinic name</Label>
            <Input id="clinicName" name="clinicName" required placeholder="GlowHaus Clinic" />
          </div>
          <div>
            <Label htmlFor="clinicEmail">Clinic email</Label>
            <Input
              id="clinicEmail"
              name="clinicEmail"
              type="email"
              required
              placeholder="hello@glowhausclinic.ng"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adminName">Your name</Label>
              <Input id="adminName" name="adminName" required placeholder="Amaka Johnson" />
            </div>
            <div>
              <Label htmlFor="adminEmail">Your email</Label>
              <Input id="adminEmail" name="adminEmail" type="email" required placeholder="you@clinic.ng" />
            </div>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>

          <div>
            <Label>Billing cycle</Label>
            <div className="grid grid-cols-2 gap-3">
              {(['ANNUAL', 'MONTHLY'] as const).map((cycle) => (
                <button
                  type="button"
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                    billingCycle === cycle
                      ? 'border-sage-500 bg-sage-50'
                      : 'border-clinical-border bg-white'
                  }`}
                >
                  <span className="block font-semibold text-clinical-text">
                    {cycle === 'ANNUAL' ? 'Annual' : 'Monthly'}
                  </span>
                  <span className="text-clinical-muted">{formatNaira(PRICING[cycle])}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Setting up…' : 'Create clinic account'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-clinical-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-sage-700">
            Log in
          </Link>
        </p>
      </Card>
    </main>
  );
}
