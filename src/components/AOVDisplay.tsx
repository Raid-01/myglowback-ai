import { Card } from '@/components/ui/card';
import { formatNaira } from '@/lib/utils';
import { TargetAOVEditor } from '@/components/AOVSetup';

export function AOVDisplay({
  currentMonthAOV,
  currentWeekAOV,
  currentTodayAOV,
  startAOV,
  targetAOVMonthly,
  targetAOVQuarterly,
  targetAOVHalfYearly,
  targetAOVYearly,
}: {
  currentMonthAOV: number | null;
  currentWeekAOV: number | null;
  currentTodayAOV: number | null;
  startAOV: number | null;
  targetAOVMonthly: number | null;
  targetAOVQuarterly: number | null;
  targetAOVHalfYearly: number | null;
  targetAOVYearly: number | null;
}) {
  const hittingTarget = targetAOVMonthly != null && currentMonthAOV != null && currentMonthAOV >= targetAOVMonthly;
  // Sage = at/above target, honey-toned warn = below target. Target itself
  // always stays honey — same color every time, so it always reads as "the
  // goal," never "the result." That's the color-coding this is trained on.
  const currentColor = targetAOVMonthly == null ? 'text-clinical-text' : hittingTarget ? 'text-sage-700' : 'text-warn';

  const lift = startAOV && currentMonthAOV != null ? ((currentMonthAOV - startAOV) / startAOV) * 100 : null;

  return (
    <Card className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-medium text-clinical-text">Average Order Value</h2>
        <TargetAOVEditor
          targetAOVMonthly={targetAOVMonthly}
          targetAOVQuarterly={targetAOVQuarterly}
          targetAOVHalfYearly={targetAOVHalfYearly}
          targetAOVYearly={targetAOVYearly}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-clinical-muted">
            Current AOV, this month
          </p>
          <p className={`mt-1 font-display text-3xl font-medium ${currentColor}`}>
            {currentMonthAOV != null ? formatNaira(currentMonthAOV) : '—'}
          </p>
          {lift != null && (
            <p className="mt-1 text-xs text-clinical-muted">
              {lift >= 0 ? '+' : ''}
              {lift.toFixed(0)}% vs. your {formatNaira(startAOV!)} baseline before the app
            </p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-clinical-muted">
            Target AOV, this month
          </p>
          <p className="mt-1 font-display text-3xl font-medium text-honey-700">
            {targetAOVMonthly != null ? formatNaira(targetAOVMonthly) : 'Not set'}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-clinical-border pt-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-clinical-muted">Today</p>
          <p className="text-sm font-medium text-clinical-text">
            {currentTodayAOV != null ? formatNaira(currentTodayAOV) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-clinical-muted">This week</p>
          <p className="text-sm font-medium text-clinical-text">
            {currentWeekAOV != null ? formatNaira(currentWeekAOV) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-clinical-muted">Quarterly target</p>
          <p className="text-sm font-medium text-clinical-text">
            {targetAOVQuarterly != null ? formatNaira(targetAOVQuarterly) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-clinical-muted">Yearly target</p>
          <p className="text-sm font-medium text-clinical-text">
            {targetAOVYearly != null ? formatNaira(targetAOVYearly) : '—'}
          </p>
        </div>
      </div>
    </Card>
  );
}
