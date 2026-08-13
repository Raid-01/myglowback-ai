import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { formatNaira } from '@/lib/utils';
import { Wallet, TrendingUp, ShoppingBag } from 'lucide-react';

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const session = await requireSession();
  if (!session.user.clinicId) return null;

  const to = searchParams.to ? new Date(searchParams.to + 'T23:59:59') : new Date();
  const from = searchParams.from
    ? new Date(searchParams.from + 'T00:00:00')
    : new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000); // default: last 30 days

  const sales = await prisma.sale.findMany({
    where: { clinicId: session.user.clinicId, createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: 'desc' },
  });

  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalItems = sales.reduce((sum, s) => sum + s.quantity, 0);

  // Bucket by day for the daily breakdown, most recent day first.
  const byDay = new Map<string, number>();
  for (const s of sales) {
    const day = s.createdAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + s.amount);
  }
  const dailyRows = [...byDay.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));

  const todayStr = toDateInputValue(new Date());
  const todayRevenue = byDay.get(todayStr) ?? 0;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-medium text-clinical-text">Revenue</h1>
      <p className="mt-1 text-sm text-clinical-muted">
        What your clinic actually sold — recorded straight from each patient's assessment.
      </p>

      <form method="GET" className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="from" className="mb-1 block text-xs font-medium text-clinical-muted">
            From
          </label>
          <input
            type="date"
            id="from"
            name="from"
            defaultValue={toDateInputValue(from)}
            className="rounded-xl border border-clinical-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="to" className="mb-1 block text-xs font-medium text-clinical-muted">
            To
          </label>
          <input
            type="date"
            id="to"
            name="to"
            defaultValue={toDateInputValue(to)}
            className="rounded-xl border border-clinical-border px-3 py-2 text-sm"
          />
        </div>
        <Button type="submit">Show</Button>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatsCard label="Today's Revenue" value={formatNaira(todayRevenue)} icon={Wallet} />
        <StatsCard label="Revenue, Selected Range" value={formatNaira(totalRevenue)} icon={TrendingUp} />
        <StatsCard label="Items Sold, Selected Range" value={String(totalItems)} icon={ShoppingBag} />
      </div>

      <Card className="mt-6">
        <h2 className="mb-3 font-display text-base font-medium text-clinical-text">Daily breakdown</h2>
        {dailyRows.length === 0 ? (
          <p className="text-sm text-clinical-muted">No sales recorded in this range yet.</p>
        ) : (
          <ul className="divide-y divide-clinical-border">
            {dailyRows.map(([day, amount]) => (
              <li key={day} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-clinical-text">
                  {new Date(day + 'T00:00:00').toLocaleDateString('en-NG', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <span className="font-medium text-clinical-text">{formatNaira(amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="mb-3 font-display text-base font-medium text-clinical-text">Every sale in range</h2>
        {sales.length === 0 ? (
          <p className="text-sm text-clinical-muted">
            Nothing yet — record a sale from any patient's assessment page after they buy.
          </p>
        ) : (
          <ul className="divide-y divide-clinical-border">
            {sales.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <span className="text-clinical-text">{s.productName}</span>
                  {s.quantity > 1 && <span className="text-clinical-muted"> × {s.quantity}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-clinical-muted">
                    {s.createdAt.toLocaleDateString('en-NG')}
                  </span>
                  <span className="font-medium text-clinical-text">{formatNaira(s.amount)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
