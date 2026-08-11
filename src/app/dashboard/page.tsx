import { redirect } from 'next/navigation';
import { Users, ClipboardList, Package, Wallet } from 'lucide-react';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { StatsCard } from '@/components/StatsCard';
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
  // What used to sit here summed this clinic's PAID invoices — but every
  // Invoice row is this clinic paying US for their subscription, not
  // anything this clinic sold to a patient. Showing that back to a clinic
  // owner labeled "Revenue" was actively misleading, not just mislabeled.
  // There's no real sales-tracking model yet (no "sold X to patient Y for
  // ₦Z" record exists anywhere), so rather than fabricate a number, this
  // shows something true and still tied to the sales-enablement pitch:
  // how many product recommendations the app has actually put in front of
  // this clinic's patients.
  const recommendationCount = await prisma.assessment.findMany({
    where: { clinicId },
    select: { matchedProducts: true, suggestedUpsells: true },
  });
  const totalRecommendations = recommendationCount.reduce(
    (sum, a) => sum + a.matchedProducts.length + a.suggestedUpsells.length,
    0
  );

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
        <StatsCard label="Product Recommendations Made" value={String(totalRecommendations)} icon={Wallet} />
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
