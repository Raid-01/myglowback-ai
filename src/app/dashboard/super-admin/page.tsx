import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/StatsCard';
import { formatNaira } from '@/lib/utils';
import { Building2, Wallet, ClipboardList, Users } from 'lucide-react';

export default async function SuperAdminPage() {
  await requireRole(['SUPER_ADMIN']);

  const clinics = await prisma.clinic.findMany({
    include: {
      _count: { select: { assessments: true, patients: true } },
      invoices: { where: { status: 'PAID' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalRevenue = clinics.reduce(
    (sum, c) => sum + c.invoices.reduce((s, inv) => s + inv.amount, 0),
    0
  );
  const totalAssessments = clinics.reduce((sum, c) => sum + c._count.assessments, 0);
  const activeClinics = clinics.filter((c) => c.isActive).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-clinical-text">Super Admin</h1>
      <p className="mt-1 text-sm text-clinical-muted">Global view across every clinic.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Active Clinics" value={`${activeClinics} / ${clinics.length}`} icon={Building2} />
        <StatsCard label="Total Revenue" value={formatNaira(totalRevenue)} icon={Wallet} />
        <StatsCard label="Total Assessments" value={String(totalAssessments)} icon={ClipboardList} />
        <StatsCard
          label="Total Patients"
          value={String(clinics.reduce((s, c) => s + c._count.patients, 0))}
          icon={Users}
        />
      </div>

      <Card className="mt-8">
        <h2 className="mb-4 font-display text-lg font-medium text-clinical-text">All clinics</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-clinical-border text-xs uppercase tracking-wide text-clinical-muted">
              <th className="pb-2">Clinic</th>
              <th className="pb-2">Cycle</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Renews</th>
              <th className="pb-2">Revenue</th>
              <th className="pb-2">Assessments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-clinical-border">
            {clinics.map((c) => (
              <tr key={c.id}>
                <td className="py-3">
                  <p className="font-medium text-clinical-text">{c.name}</p>
                  <p className="text-xs text-clinical-muted">{c.email}</p>
                </td>
                <td className="py-3 text-clinical-text">
                  {c.billingCycle === 'ANNUAL' ? 'Annual' : 'Monthly'}
                </td>
                <td className="py-3">
                  <Badge tone={!c.isActive ? 'danger' : c.isTrialing ? 'honey' : 'sage'}>
                    {!c.isActive ? 'Expired' : c.isTrialing ? 'Trial' : 'Active'}
                  </Badge>
                </td>
                <td className="py-3 text-clinical-text">
                  {c.subscriptionEnd.toLocaleDateString('en-NG')}
                </td>
                <td className="py-3 text-clinical-text">
                  {formatNaira(c.invoices.reduce((s, inv) => s + inv.amount, 0))}
                </td>
                <td className="py-3 text-clinical-text">{c._count.assessments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
