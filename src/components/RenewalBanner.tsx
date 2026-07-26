import Link from 'next/link';
import { cn } from '@/lib/utils';

export function RenewalBanner({ daysUntilExpiry }: { daysUntilExpiry: number }) {
  if (daysUntilExpiry > 30) return null;

  const level = daysUntilExpiry <= 10 ? 'red' : 'orange';
  const expired = daysUntilExpiry < 0;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-6 py-2.5 text-sm font-medium',
        level === 'red' ? 'bg-danger/90 text-white' : 'bg-warn/90 text-white'
      )}
    >
      <span>
        {expired
          ? 'Your subscription has expired. Renew now to restore access.'
          : `${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'} until your subscription renews.`}
      </span>
      <Link href="/dashboard/billing" className="whitespace-nowrap underline underline-offset-2">
        Renew now →
      </Link>
    </div>
  );
}
