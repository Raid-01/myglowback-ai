import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/StatsCard';
import { LockedPriceEditor } from '@/components/LockedPriceEditor';
import { LicenseVerificationEditor } from '@/components/LicenseVerificationEditor';
import { formatNaira } from '@/lib/utils';
import { Building2, Wallet, ClipboardList, Users } from 'lucide-react';
import Link from 'next/link';

export default async function SuperAdminPage() {
  await requireRole(['SUPER_ADMIN']);

  const clinics = await prisma.clinic.findMany({
    include: {
      _count: { select: { assessments: true, patients: true } },
      invoices: { where: { status: 'PAID' } },
      assessments: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  function daysSince(date: Date | undefined): number | null {
    if (!date) return null;
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  }

  const totalRevenue = clinics.reduce(
    (sum, c) => sum + c.invoices.reduce((s, inv) => s + inv.amount, 0),
    0
  );
  const totalAssessments = clinics.reduce((sum, c) => sum + c._count.assessments, 0);
  const activeClinics = clinics.filter((c) => c.isActive).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-clinical-text">Super Admin</h1>
          <p className="mt-1 text-sm text-clinical-muted">Global view across every clinic.</p>
        </div>
        <Link href="/dashboard/super-admin/analytics" className="text-sm font-medium text-sage-700">
          View analytics →
        </Link>
      </div>

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
              <th className="pb-2">Last Active</th>
              <th className="pb-2">License</th>
              <th className="pb-2">Locked Rate</th>
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
                <td className="py-3">
                  {(() => {
                    const days = daysSince(c.assessments[0]?.createdAt);
                    if (days === null) {
                      return c.isTrialing ? (
                        <span className="text-xs text-honey-700">No assessments yet</span>
                      ) : (
                        <span className="text-xs text-danger">Never — activation risk</span>
                      );
                    }
                    return (
                      <span className={days > 14 ? 'text-xs font-medium text-danger' : 'text-xs text-clinical-text'}>
                        {days === 0 ? 'Today' : `${days}d ago`}
                      </span>
                    );
                  })()}
                </td>
                <td className="py-3">
                  <LicenseVerificationEditor
                    clinicId={c.id}
                    initialLicenseType={c.licenseType}
                    initialVerified={c.licenseVerifiedAt !== null}
                    initialLicenseNumber={c.professionalLicenseNumber}
                  />
                </td>
                <td className="py-3">
                  <LockedPriceEditor
                    clinicId={c.id}
                    initialAnnual={c.lockedAnnualPrice}
                    initialMonthly={c.lockedMonthlyPrice}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
