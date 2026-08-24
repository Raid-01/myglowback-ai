import { Check } from 'lucide-react';
import { Label } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

export function ChoiceGroup({
  label,
  options,
  value,
  onChange,
  columns = 1,
  hint,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
  hint?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {hint && <p className="mb-2 -mt-1 text-xs text-clinical-muted">{hint}</p>}
      <div className={cn('grid gap-2', GRID_COLS[columns] ?? GRID_COLS[1])}>
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(o.value)}
              className={cn(
                'flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-all active:scale-[0.98]',
                selected
                  ? 'border-sage-600 bg-sage-600 text-white shadow-soft'
                  : 'border-clinical-border bg-white text-clinical-text hover:border-sage-300 hover:bg-sage-50'
              )}
            >
              {o.label}
              {selected && <Check size={15} strokeWidth={2.5} className="shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function YesNo({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <ChoiceGroup
      label={label}
      columns={2}
      value={value ? 'yes' : 'no'}
      onChange={(v) => onChange(v === 'yes')}
      options={[
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ]}
    />
  );
}
