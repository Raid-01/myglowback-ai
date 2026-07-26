'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn, formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const ANNUAL = 450_000;
const MONTHLY = 55_000;

export function PricingCalculator() {
  const [cycle, setCycle] = useState<'ANNUAL' | 'MONTHLY'>('ANNUAL');
  const price = cycle === 'ANNUAL' ? ANNUAL : MONTHLY;
  const annualEquivalent = MONTHLY * 12;
  const savings = annualEquivalent - ANNUAL;

  return (
    <div className="mx-auto max-w-md rounded-card border border-clinical-border bg-white p-8 text-center shadow-soft">
      <div className="mx-auto mb-6 inline-flex rounded-full bg-ivory-200 p-1">
        {(['ANNUAL', 'MONTHLY'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCycle(c)}
            className={cn(
              'rounded-full px-5 py-1.5 text-sm font-medium transition-colors',
              cycle === c ? 'bg-sage-600 text-white' : 'text-clinical-muted'
            )}
          >
            {c === 'ANNUAL' ? 'Annual' : 'Monthly'}
          </button>
        ))}
      </div>

      <p className="font-display text-4xl font-medium text-clinical-text">
        {formatNaira(price)}
        <span className="text-base font-normal text-clinical-muted">
          {' '}
          / {cycle === 'ANNUAL' ? 'year' : 'month'}
        </span>
      </p>
      <p className="mt-1 text-sm text-clinical-muted">per clinic location</p>

      {cycle === 'ANNUAL' && (
        <p className="mt-3 inline-block rounded-full bg-honey-100 px-3 py-1 text-xs font-medium text-honey-700">
          Save {formatNaira(savings)} vs. paying monthly
        </p>
      )}

      <Link href="/signup" className="mt-6 block">
        <Button variant="primary" size="lg" className="w-full">
          Start Free Trial
        </Button>
      </Link>
      <p className="mt-3 text-xs text-clinical-muted">
        You can switch billing cycles at renewal.
      </p>
    </div>
  );
}
