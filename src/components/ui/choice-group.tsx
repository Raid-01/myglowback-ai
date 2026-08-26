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
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors',
              value === o.value
                ? 'border-sage-500 bg-sage-50 text-sage-800'
                : 'border-clinical-border bg-white text-clinical-text hover:bg-ivory-100'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// value is boolean|null deliberately — null means "not answered yet," and
// must never render as if "No" were clicked. A fresh assessment should show
// nothing selected until the staff member actually taps an option.
export function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <ChoiceGroup
      label={label}
      columns={2}
      value={value === true ? 'yes' : value === false ? 'no' : ''}
      onChange={(v) => onChange(v === 'yes')}
      options={[
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ]}
    />
  );
}

// Multi-select variant of ChoiceGroup — same visual language (fills solid
// sage + checkmark when picked), but any number of options can be active at
// once. Used for follow-ups like "how does it change?" where more than one
// answer can genuinely apply.
export function MultiChoiceGroup({
  label,
  options,
  values,
  onChange,
  columns = 1,
  hint,
}: {
  label: string;
  options: { value: string; label: string }[];
  values: string[];
  onChange: (v: string[]) => void;
  columns?: number;
  hint?: string;
}) {
  const toggle = (v: string) => {
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  };
  return (
    <div>
      <Label>{label}</Label>
      {hint && <p className="mb-2 -mt-1 text-xs text-clinical-muted">{hint}</p>}
      <div className={cn('grid gap-2', GRID_COLS[columns] ?? GRID_COLS[1])}>
        {options.map((o) => {
          const selected = values.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(o.value)}
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
