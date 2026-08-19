import { cn } from '@/lib/utils';
import { CONCERNS, type FormState } from '@/lib/assessment-scoring';

export function ConcernsStep({
  state,
  toggleConcern,
}: {
  state: FormState;
  toggleConcern: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-medium text-clinical-text">What would you like help with?</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CONCERNS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => toggleConcern(c.value)}
            className={cn(
              'rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
              state.concerns.includes(c.value)
                ? 'border-sage-500 bg-sage-50 text-sage-800'
                : 'border-clinical-border bg-white text-clinical-text'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-clinical-muted">Select all that apply.</p>
    </div>
  );
}
