import { redirect } from 'next/navigation';
import { Users, ClipboardList, Package, Wallet } from 'lucide-react';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { StatsCard } from '@/components/StatsCard';
import { formatNaira } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function DashboardOverviewPage() {
  const session = await requireSession();
  if (session.user.role === 'SUPER_ADMIN') redirect('/dashboard/super-admin');

  const clinicId = session.user.clinicId!;

  const [patientCount, assessmentCount, products, recentAssessments] = await Promise.all([
    prisma.patient.count({ where: { clinicId } }),
    prisma.assessment.count({ where: { clinicId } }),
    prisma.product.findMany({ where: { clinicId } }),
    prisma.assessment.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { patient: true },
    }),
  ]);

  const totalStock = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  // Used to sum this clinic's PAID invoices — but every Invoice row is this
  // clinic paying US for their subscription, not anything sold to a
  // patient. That was actively misleading labeled "Revenue." A real Sale
  // model exists now (see /dashboard/revenue for the full report with a
  // custom date range) — this just needs today's slice of it.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todaysSales = await prisma.sale.findMany({
    where: { clinicId, createdAt: { gte: startOfToday } },
    select: { amount: true },
  });
  const todaysRevenue = todaysSales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-clinical-text">Overview</h1>
      <p className="mt-1 text-sm text-clinical-muted">
        A snapshot of your clinic&apos;s activity.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Patients" value={String(patientCount)} icon={Users} />
        <StatsCard label="Assessments" value={String(assessmentCount)} icon={ClipboardList} />
        <StatsCard label="Products in Stock" value={String(totalStock)} icon={Package} />
        <a href="/dashboard/revenue">
          <StatsCard label="Today's Revenue" value={formatNaira(todaysRevenue)} icon={Wallet} />
        </a>
      </div>

      <Card className="mt-8">
        <h2 className="mb-4 font-display text-lg font-medium text-clinical-text">
          Recent assessments
        </h2>
        {recentAssessments.length === 0 ? (
          <p className="text-sm text-clinical-muted">
            No assessments yet — start one from the New Assessment tab.
          </p>
        ) : (
          <ul className="divide-y divide-clinical-border">
            {recentAssessments.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-clinical-text">
                    {a.patient.firstName} {a.patient.lastName}
                  </p>
                  <p className="text-xs text-clinical-muted">
                    {new Date(a.createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {a.concerns.map((c) => (
                    <Badge key={c} tone="sage">
                      {c.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
