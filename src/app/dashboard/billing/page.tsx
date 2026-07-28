import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { daysUntilInLagos } from '@/lib/date';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BillingActions } from '@/components/BillingActions';
import { formatNaira } from '@/lib/utils';
import { Download } from 'lucide-react';

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { welcome?: string; ref?: string };
}) {
  const session = await requireRole(['CLINIC_ADMIN']);
  const clinic = await prisma.clinic.findUniqueOrThrow({ where: { id: session.user.clinicId! } });
  const invoices = await prisma.invoice.findMany({
    where: { clinicId: clinic.id },
    orderBy: { createdAt: 'desc' },
  });

  const daysUntilExpiry = daysUntilInLagos(clinic.subscriptionEnd);
  const expired = daysUntilExpiry < 0 || !clinic.isActive;
  const status = expired ? 'Expired' : clinic.isTrialing ? 'Trial' : 'Active';

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-clinical-text">Billing</h1>
      <p className="mt-1 text-sm text-clinical-muted">
        Manage your subscription, invoices, and payment.
      </p>

      {searchParams.welcome && clinic.isTrialing && (
        <div className="mt-4 rounded-xl bg-honey-100 px-4 py-3 text-sm text-honey-700">
          Welcome! You&apos;re on a 14-day free trial — no payment needed yet. Add payment anytime
          below to continue seamlessly once your trial ends.
        </div>
      )}
      {searchParams.ref && (
        <div className="mt-4 rounded-xl bg-sage-100 px-4 py-3 text-sm text-sage-700">
          Thanks — we&apos;re confirming your payment with Paystack. This can take a few seconds
          to reflect below; refresh if it doesn&apos;t update right away.
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-medium text-clinical-text">
              {clinic.isTrialing ? 'Free trial' : 'Current subscription'}
            </h2>
            <Badge tone={status === 'Active' ? 'sage' : status === 'Trial' ? 'honey' : 'danger'}>
              {status}
            </Badge>
          </div>

          {clinic.isTrialing && !expired && (
            <p className="mt-2 text-sm text-clinical-muted">
              {daysUntilExpiry} day{daysUntilExpiry === 1 ? '' : 's'} left in your trial — your
              chosen plan is {clinic.billingCycle === 'ANNUAL' ? 'Annual' : 'Monthly'}, charged
              only once you add payment.
            </p>
          )}

          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-clinical-muted">Cycle</dt>
              <dd className="font-medium text-clinical-text">
                {clinic.billingCycle === 'ANNUAL' ? 'Annual' : 'Monthly'}
              </dd>
            </div>
            <div>
              <dt className="text-clinical-muted">Start Date</dt>
              <dd className="font-medium text-clinical-text">
                {clinic.subscriptionStart.toLocaleDateString('en-NG')}
              </dd>
            </div>
            <div>
              <dt className="text-clinical-muted">
                {clinic.isTrialing ? 'Trial Ends' : 'End Date'}
              </dt>
              <dd className="font-medium text-clinical-text">
                {clinic.subscriptionEnd.toLocaleDateString('en-NG')}
              </dd>
            </div>
          </dl>

          <h3 className="mt-8 mb-3 font-display text-base font-medium text-clinical-text">
            Invoice history
          </h3>
          {invoices.length === 0 ? (
            <p className="text-sm text-clinical-muted">
              {clinic.isTrialing
                ? "No invoices yet — you're still in your free trial."
                : 'No invoices yet.'}
            </p>
          ) : (
            <ul className="divide-y divide-clinical-border">
              {invoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-clinical-text">{inv.invoiceNumber}</p>
                    <p className="text-clinical-muted">
                      {inv.createdAt.toLocaleDateString('en-NG')} · {formatNaira(inv.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={inv.status === 'PAID' ? 'sage' : 'honey'}>{inv.status}</Badge>
                    <a
                      href={`/api/invoices/${inv.id}/pdf`}
                      className="flex items-center gap-1 text-sage-700 hover:text-sage-800"
                      title="Download PDF"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-medium text-clinical-text">Actions</h2>
          <BillingActions
            billingCycle={clinic.billingCycle}
            canSwitchCycle={daysUntilExpiry <= 10}
            daysUntilExpiry={daysUntilExpiry}
            isTrialing={clinic.isTrialing}
          />
        </Card>
      </div>
    </div>
  );
}
