import { cn } from '@/lib/utils';

const tones = {
  sage: 'bg-sage-100 text-sage-700',
  honey: 'bg-honey-100 text-honey-700',
  danger: 'bg-red-100 text-danger',
  neutral: 'bg-ivory-200 text-clinical-muted',
};

export function Badge({
  tone = 'sage',
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium tracking-tight',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
