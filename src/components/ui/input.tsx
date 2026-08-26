import { InputHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-clinical-border bg-white px-4 py-2.5 text-sm text-clinical-text placeholder:text-clinical-muted focus:outline-none focus:ring-2 focus:ring-sage-400',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('mb-1.5 block text-sm font-medium text-clinical-text', className)} {...props} />
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'w-full appearance-none rounded-xl border border-clinical-border bg-white px-4 py-2.5 pr-10 text-sm text-clinical-text focus:outline-none focus:ring-2 focus:ring-sage-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-clinical-muted" />
    </div>
  )
);
Select.displayName = 'Select';
