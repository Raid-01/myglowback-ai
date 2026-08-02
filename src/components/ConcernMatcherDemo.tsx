'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const CONCERNS = [
  {
    key: 'ACNE',
    label: 'Acne',
    routine: ['Salicylic acid cleanser', 'Niacinamide serum', 'Oil-free moisturizer', 'Mineral SPF 50'],
    followUp: '30-day follow-up',
  },
  {
    key: 'HYPERPIGMENTATION',
    label: 'Hyperpigmentation',
    routine: ['Vitamin C serum', 'Tranexamic acid', 'Ceramide moisturizer', 'Mineral SPF 50'],
    followUp: '45-day follow-up',
  },
  {
    key: 'SUN_DAMAGE',
    label: 'Sun Damage',
    routine: ['Antioxidant serum', 'Barrier repair cream', 'Mineral SPF 50, reapplied midday'],
    followUp: '30-day follow-up',
  },
  {
    key: 'AGING',
    label: 'Anti-Aging',
    routine: ['Vitamin C serum', 'Peptide moisturizer', 'Retinaldehyde night cream', 'Mineral SPF 50'],
    followUp: '60-day follow-up',
  },
  {
    key: 'GLOWING_SKIN',
    label: 'Glowing Skin',
    routine: ['Gentle cleanser', 'Vitamin C serum', 'Hyaluronic acid + ceramide moisturizer', 'Mineral SPF 30'],
    followUp: '30-day follow-up',
  },
] as const;

export function ConcernMatcherDemo() {
  const [active, setActive] = useState<(typeof CONCERNS)[number]>(CONCERNS[0]);

  return (
    <div className="rounded-card border border-clinical-border bg-white p-6 shadow-soft sm:p-8">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-clinical-muted">
        Tap a concern to see the match
      </p>
      <div className="mb-6 flex flex-wrap gap-2">
        {CONCERNS.map((c) => (
          <button
            key={c.key}
            onClick={() => setActive(c)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active.key === c.key
                ? 'bg-sage-600 text-white'
                : 'bg-ivory-200 text-clinical-text hover:bg-sage-100'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-ivory-100 p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-base text-sage-800">{active.label} protocol</span>
          <span className="rounded-full bg-honey-100 px-2.5 py-0.5 text-xs font-medium text-honey-700">
            {active.followUp}
          </span>
        </div>
        <ol className="space-y-2">
          {active.routine.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-sm text-clinical-text">
              <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-sage-600 text-[11px] font-semibold text-white">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
