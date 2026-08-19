'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatNaira } from '@/lib/utils';

export function BillingActions({
  billingCycle,
  canSwitchCycle,
  daysUntilExpiry,
  isTrialing,
  annualPrice,
  monthlyPrice,
}: {
  billingCycle: 'ANNUAL' | 'MONTHLY';
  canSwitchCycle: boolean;
  daysUntilExpiry: number;
  isTrialing: boolean;
  annualPrice: number;
  monthlyPrice: number;
}) {
  const router = useRouter();
  // Controls whether the yearly/monthly choice is showing yet — "Renew Now"
  // reveals it rather than immediately charging whatever cycle happens to
  // be currently stored, so the person always sees the savings and makes
  // an active choice at the moment that matters most.
  const [showPlans, setShowPlans] = useState(false);
  const [loadingCycle, setLoadingCycle] = useState<'ANNUAL' | 'MONTHLY' | null>(null);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const yearlySavings = monthlyPrice * 12 - annualPrice;

  async function handleCheckout(cycle: 'ANNUAL' | 'MONTHLY') {
    setLoadingCycle(cycle);
    setError(null);
    try {
      const res = await fetch('/api/paystack/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingCycle: cycle }),
      });
      const data = await res.json();
      if (res.ok && data.authorization_url) {
        window.location.href = data.authorization_url;
        return; // navigating away — leave the button in its loading state
      }
      setError(data.error ?? 'Could not start checkout.');
      setLoadingCycle(null);
    } catch {
      setError('Could not reach the payment provider. Try again in a moment.');
      setLoadingCycle(null);
    }
  }

  async function handleSwitch(cycle: 'ANNUAL' | 'MONTHLY') {
    setSwitching(true);
    setError(null);
    try {
      const res = await fetch('/api/clinic/billing-cycle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingCycle: cycle }),
      });
      setSwitching(false);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? 'Could not switch billing cycle.');
        return;
      }
      router.refresh();
    } catch {
      setSwitching(false);
      setError('Could not reach the server. Check your connection and try again.');
    }
  }

  return (
    <div className="space-y-4">
      {!showPlans ? (
        <Button size="lg" onClick={() => setShowPlans(true)} className="w-full">
          {isTrialing ? 'Add Payment →' : 'Renew Now →'}
        </Button>
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleCheckout('ANNUAL')}
            disabled={loadingCycle !== null}
            className="w-full rounded-xl border-2 border-sage-500 bg-sage-50 p-4 text-left transition-colors disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-medium text-sage-800">Annual Plan</span>
              {yearlySavings > 0 && (
                <span className="rounded-full bg-honey-100 px-2.5 py-1 text-xs font-semibold text-honey-700">
                  Save {formatNaira(yearlySavings)}/year
                </span>
              )}
            </div>
            <p className="mt-1 text-2xl font-semibold text-clinical-text">
              {formatNaira(annualPrice)}
              <span className="text-sm font-normal text-clinical-muted"> /year</span>
            </p>
            <p className="mt-1 text-sm text-sage-700">
              {loadingCycle === 'ANNUAL' ? 'Taking you to checkout…' : 'Continue with Annual →'}
            </p>
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => handleCheckout('MONTHLY')}
              disabled={loadingCycle !== null}
              className="text-sm font-medium text-clinical-muted underline decoration-dotted hover:text-clinical-text disabled:opacity-60"
            >
              {loadingCycle === 'MONTHLY'
                ? 'Taking you to checkout…'
                : `I prefer the monthly plan (${formatNaira(monthlyPrice)}/mo) →`}
            </button>
          </div>
        </div>
      )}

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
                <span className="text-clinical-muted">
                  {formatNaira(cycle === 'ANNUAL' ? annualPrice : monthlyPrice)}
                </span>
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
