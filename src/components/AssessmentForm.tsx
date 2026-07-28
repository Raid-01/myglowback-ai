'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const CONCERNS = [
  { value: 'ACNE', label: 'Acne' },
  { value: 'HYPERPIGMENTATION', label: 'Hyperpigmentation' },
  { value: 'SUN_DAMAGE', label: 'Sun Damage' },
  { value: 'AGING', label: 'Anti-Aging' },
] as const;

const SKIN_TYPES = ['OILY', 'DRY', 'COMBINATION', 'SENSITIVE', 'NORMAL'] as const;
const AGE_RANGES = [
  { value: 'UNDER_18', label: 'Under 18' },
  { value: 'AGE_18_25', label: '18–25' },
  { value: 'AGE_26_35', label: '26–35' },
  { value: 'AGE_36_45', label: '36–45' },
  { value: 'AGE_46_55', label: '46–55' },
  { value: 'AGE_55_PLUS', label: '55+' },
] as const;

export function AssessmentForm({ patients }: { patients: { id: string; firstName: string; lastName: string }[] }) {
  const router = useRouter();
  const [isNewPatient, setIsNewPatient] = useState(patients.length === 0);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleConcern(value: string) {
    setConcerns((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (concerns.length === 0) {
      setError('Select at least one of the four core concerns.');
      return;
    }

    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      skinType: form.get('skinType'),
      concerns,
      allergies: form.get('allergies') || undefined,
      goals: form.get('goals') || undefined,
      ageRange: form.get('ageRange') || undefined,
    };

    if (isNewPatient) {
      payload.firstName = form.get('firstName');
      payload.lastName = form.get('lastName');
      payload.phone = form.get('phone');
      payload.email = form.get('email') || undefined;
    } else {
      payload.patientId = form.get('patientId');
    }

    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setLoading(false);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error?.formErrors?.[0] ?? body?.error ?? 'Something went wrong.');
        return;
      }

      const { id } = await res.json();
      router.push(`/dashboard/assessments/${id}`);
    } catch {
      setLoading(false);
      setError('Could not reach the server. Check your connection and try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-clinical-text">Patient</h2>
          {patients.length > 0 && (
            <button
              type="button"
              onClick={() => setIsNewPatient((v) => !v)}
              className="text-sm font-medium text-sage-700"
            >
              {isNewPatient ? 'Choose existing patient' : 'Add new patient'}
            </button>
          )}
        </div>

        {isNewPatient ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required placeholder="+234..." />
            </div>
            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" name="email" type="email" />
            </div>
          </div>
        ) : (
          <div>
            <Label htmlFor="patientId">Patient</Label>
            <Select id="patientId" name="patientId" required>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </Select>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-lg font-medium text-clinical-text">Assessment</h2>

        <div className="mb-5">
          <Label>Core concern(s)</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CONCERNS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => toggleConcern(c.value)}
                className={cn(
                  'rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                  concerns.includes(c.value)
                    ? 'border-sage-500 bg-sage-50 text-sage-800'
                    : 'border-clinical-border bg-white text-clinical-text'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="skinType">Skin type</Label>
            <Select id="skinType" name="skinType" required defaultValue="">
              <option value="" disabled>
                Select skin type
              </option>
              {SKIN_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="ageRange">Age range (optional)</Label>
            <Select id="ageRange" name="ageRange" defaultValue="">
              <option value="">Prefer not to say</option>
              {AGE_RANGES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="allergies">Allergies (optional)</Label>
          <Input id="allergies" name="allergies" placeholder="e.g. retinol, fragrance" />
        </div>
        <div className="mt-4">
          <Label htmlFor="goals">Goals (optional)</Label>
          <Input id="goals" name="goals" placeholder="e.g. clear skin before wedding in 3 months" />
        </div>
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? 'Matching…' : 'Generate Routine'}
      </Button>
    </form>
  );
}
