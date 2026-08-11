import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { StatsCard } from '@/components/StatsCard';
import { formatNaira } from '@/lib/utils';
import { PRICING } from '@/lib/paystack';
import { TrendingUp, UserCheck, AlertTriangle, Wallet } from 'lucide-react';

function weekLabel(date: Date): string {
  // Monday-anchored week label, e.g. "Aug 4"
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

function bucketByWeek(dates: Date[], weeks: number): { label: string; count: number }[] {
  const cutoffs: { label: string; start: Date; end: Date }[] = [];
  const now = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    cutoffs.push({ label: weekLabel(start), start, end });
  }
  return cutoffs.map(({ label, start, end }) => ({
    label,
    count: dates.filter((d) => d >= start && d < end).length,
  }));
}

function Bar({ data, maxHeight = 80 }: { data: { label: string; count: number }[]; maxHeight?: number }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-2" style={{ height: maxHeight + 24 }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs font-medium text-clinical-text">{d.count}</span>
          <div
            className="w-full rounded-t-md bg-sage-400"
            style={{ height: Math.max((d.count / max) * maxHeight, 2) }}
          />
          <span className="text-[10px] text-clinical-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default async function AnalyticsPage() {
  await requireRole(['SUPER_ADMIN']);

  const [clinics, assessments] = await Promise.all([
    prisma.clinic.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        isActive: true,
        isTrialing: true,
        billingCycle: true,
        lockedAnnualPrice: true,
        lockedMonthlyPrice: true,
        _count: { select: { assessments: true } },
      },
    }),
    prisma.assessment.findMany({ select: { createdAt: true } }),
  ]);

  // --- Trial → Paid conversion ---
  // isTrialing flips to false only on a successful payment (see the
  // Paystack webhook), so "ever converted" = currently not trialing.
  // "Trial decided" excludes clinics still mid-trial, since their outcome
  // isn't known yet — including them would understate the real rate.
  const stillTrialing = clinics.filter((c) => c.isTrialing && c.isActive).length;
  const trialDecided = clinics.length - stillTrialing;
  const everConverted = clinics.filter((c) => !c.isTrialing).length;
  const conversionRate = trialDecided > 0 ? Math.round((everConverted / trialDecided) * 100) : null;

  // --- Activation risk: signed up, never once ran an assessment ---
  const neverActivated = clinics.filter((c) => c._count.assessments === 0);

  // --- MRR estimate, accounting for locked rates ---
  const activePayingClinics = clinics.filter((c) => c.isActive && !c.isTrialing);
  const mrr = activePayingClinics.reduce((sum, c) => {
    if (c.billingCycle === 'ANNUAL') {
      return sum + (c.lockedAnnualPrice ?? PRICING.ANNUAL) / 12;
    }
    return sum + (c.lockedMonthlyPrice ?? PRICING.MONTHLY);
  }, 0);

  // --- Trends, last 8 weeks ---
  const signupTrend = bucketByWeek(clinics.map((c) => c.createdAt), 8);
  const assessmentTrend = bucketByWeek(assessments.map((a) => a.createdAt), 8);

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-clinical-text">Analytics</h1>
      <p className="mt-1 text-sm text-clinical-muted">
        Leading indicators, not a full churn survey — see the note at the bottom.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Trial → Paid Conversion"
          value={conversionRate === null ? 'No data yet' : `${conversionRate}%`}
          icon={UserCheck}
        />
        <StatsCard label="Estimated MRR" value={formatNaira(mrr)} icon={Wallet} />
        <StatsCard
          label="Never Activated"
          value={`${neverActivated.length} clinic${neverActivated.length === 1 ? '' : 's'}`}
          icon={AlertTriangle}
        />
        <StatsCard label="Assessments, All Time" value={String(assessments.length)} icon={TrendingUp} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-lg font-medium text-clinical-text">Signups per week</h2>
          <Bar data={signupTrend} />
        </Card>
        <Card>
          <h2 className="mb-4 font-display text-lg font-medium text-clinical-text">Assessments per week</h2>
          <Bar data={assessmentTrend} />
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="mb-1 font-display text-lg font-medium text-clinical-text">
          Signed up, never ran an assessment
        </h2>
        <p className="mb-4 text-sm text-clinical-muted">
          The clearest "is the app actually working for them" signal available without asking anyone
          directly — a clinic that never got to a first assessment never got to see the product do its job.
        </p>
        {neverActivated.length === 0 ? (
          <p className="text-sm text-clinical-text">None right now — every signed-up clinic has used it at least once.</p>
        ) : (
          <ul className="divide-y divide-clinical-border text-sm">
            {neverActivated.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <span className="text-clinical-text">{c.name}</span>
                <span className="text-xs text-clinical-muted">
                  Signed up {c.createdAt.toLocaleDateString('en-NG')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="mt-6 text-xs text-clinical-muted">
        Note: this page shows behavioral signals inferred from usage (activation, engagement trend,
        conversion) — genuinely useful for spotting risk early, but it doesn't capture a clinic's own
        stated reason for leaving. A simple "why are you cancelling?" prompt at the point of lapse would
        be the natural next addition once this is in use and worth the extra build.
      </p>
    </div>
  );
}
