'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatNaira } from '@/lib/utils';

const PRICING = { ANNUAL: 450_000, MONTHLY: 55_000 };

export function BillingActions({
  billingCycle,
  canSwitchCycle,
  daysUntilExpiry,
}: {
  billingCycle: 'ANNUAL' | 'MONTHLY';
  canSwitchCycle: boolean;
  daysUntilExpiry: number;
}) {
  const router = useRouter();
  const [loadingRenew, setLoadingRenew] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRenew() {
    setLoadingRenew(true);
    const res = await fetch('/api/paystack/initiate', { method: 'POST' });
    const data = await res.json();
    if (data.authorization_url) {
      window.location.href = data.authorization_url;
    } else {
      setLoadingRenew(false);
    }
  }

  async function handleSwitch(cycle: 'ANNUAL' | 'MONTHLY') {
    setSwitching(true);
    setError(null);
    const res = await fetch('/api/clinic/billing-cycle', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billingCycle: cycle }),
    });
    setSwitching(false);
    if (!res.ok) {
      const body = await res.json();
      setError(body.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Button size="lg" onClick={handleRenew} disabled={loadingRenew} className="w-full">
        {loadingRenew ? 'Taking you to checkout…' : 'Renew Now →'}
      </Button>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-clinical-muted">
          Switch billing cycle
        </p>
        {canSwitchCycle ? (
          <div className="grid grid-cols-2 gap-2">
            {(['ANNUAL', 'MONTHLY'] as const).map((cycle) => (
              <button
                key={cycle}
                disabled={switching || cycle === billingCycle}
                onClick={() => handleSwitch(cycle)}
                className={`rounded-xl border p-3 text-left text-sm transition-colors disabled:opacity-50 ${
                  cycle === billingCycle
                    ? 'border-sage-500 bg-sage-50'
                    : 'border-clinical-border bg-white hover:border-sage-300'
                }`}
              >
                <span className="block font-semibold text-clinical-text">
                  {cycle === 'ANNUAL' ? 'Annual' : 'Monthly'}
                </span>
                <span className="text-clinical-muted">{formatNaira(PRICING[cycle])}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-clinical-muted">
            Available within 10 days of renewal ({daysUntilExpiry} days left).
          </p>
        )}
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
