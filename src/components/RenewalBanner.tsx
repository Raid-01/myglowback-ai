import Link from 'next/link';
import { cn } from '@/lib/utils';

export function RenewalBanner({
  daysUntilExpiry,
  isTrialing,
}: {
  daysUntilExpiry: number;
  isTrialing: boolean;
}) {
  // Trials only show a banner in their final 3 days (7/3/1-day reminders);
  // paid subscriptions show one starting 30 days out, per spec.
  const threshold = isTrialing ? 3 : 30;
  if (daysUntilExpiry > threshold) return null;

  const level = daysUntilExpiry <= (isTrialing ? 1 : 10) ? 'red' : 'orange';
  const expired = daysUntilExpiry < 0;

  const message = expired
    ? isTrialing
      ? 'Your free trial has ended. Add payment to restore access.'
      : 'Your subscription has expired. Renew now to restore access.'
    : isTrialing
      ? `${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'} left in your free trial.`
      : `${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'} until your subscription renews.`;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-6 py-2.5 text-sm font-medium',
        level === 'red' ? 'bg-danger/90 text-white' : 'bg-warn/90 text-white'
      )}
    >
      <span>{message}</span>
      <Link href="/dashboard/billing" className="whitespace-nowrap underline underline-offset-2">
        {isTrialing ? 'Add payment →' : 'Renew now →'}
      </Link>
    </div>
  );
}
