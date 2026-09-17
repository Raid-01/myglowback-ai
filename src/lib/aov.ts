import { Sale } from '@prisma/client';

/**
 * Average Order Value is revenue ÷ number of orders — not revenue ÷ number
 * of line items. A single patient visit often produces several Sale rows
 * (one per product), all sharing the same assessmentId, so those must be
 * grouped into one order before averaging, or AOV would be silently
 * understated every time a patient buys more than one thing.
 *
 * Grouping key, in order of preference:
 *   1. assessmentId, when present — the real "one visit, one order" unit.
 *   2. patientId + calendar day, when no assessmentId — best available
 *      proxy for "this was one visit."
 *   3. the sale's own id — a walk-in sale with neither, so it can only be
 *      its own order.
 */
function orderKey(sale: Sale): string {
  if (sale.assessmentId) return `a:${sale.assessmentId}`;
  if (sale.patientId) return `p:${sale.patientId}:${sale.createdAt.toISOString().slice(0, 10)}`;
  return `s:${sale.id}`;
}

export function computeAOV(sales: Sale[]): number | null {
  if (sales.length === 0) return null;
  const orders = new Map<string, number>();
  for (const s of sales) {
    const key = orderKey(s);
    orders.set(key, (orders.get(key) ?? 0) + s.amount);
  }
  const totalRevenue = [...orders.values()].reduce((sum, v) => sum + v, 0);
  return totalRevenue / orders.size;
}

export type AOVHorizon = 'today' | 'week' | 'month' | 'quarter' | 'halfYear' | 'year';

/** Start-of-period boundary for each horizon, anchored to "now". Weeks
 * start Monday. Quarters/half-years are calendar-aligned (Jan/Apr/Jul/Oct
 * and Jan/Jul), not "3 months back from today" — that's what a clinic's
 * own accounting periods will actually match. */
export function horizonStart(horizon: AOVHorizon, now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  switch (horizon) {
    case 'today':
      return d;
    case 'week': {
      const day = d.getDay(); // 0 = Sunday
      const diffToMonday = day === 0 ? 6 : day - 1;
      d.setDate(d.getDate() - diffToMonday);
      return d;
    }
    case 'month':
      d.setDate(1);
      return d;
    case 'quarter': {
      const q = Math.floor(d.getMonth() / 3);
      d.setMonth(q * 3, 1);
      return d;
    }
    case 'halfYear': {
      d.setMonth(d.getMonth() < 6 ? 0 : 6, 1);
      return d;
    }
    case 'year':
      d.setMonth(0, 1);
      return d;
  }
}

export function targetFieldFor(horizon: AOVHorizon): 'targetAOVMonthly' | 'targetAOVQuarterly' | 'targetAOVHalfYearly' | 'targetAOVYearly' | null {
  switch (horizon) {
    case 'month':
      return 'targetAOVMonthly';
    case 'quarter':
      return 'targetAOVQuarterly';
    case 'halfYear':
      return 'targetAOVHalfYearly';
    case 'year':
      return 'targetAOVYearly';
    default:
      return null; // today/week are progress views against the monthly target, not their own separate target
  }
}
