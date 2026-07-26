import { toZonedTime } from 'date-fns-tz';
import { differenceInCalendarDays } from 'date-fns';

export const LAGOS_TZ = 'Africa/Lagos';

/**
 * Africa/Lagos does not observe daylight saving time — it is a fixed
 * UTC+1 year-round. That means "23:59:59 on the subscription end date,
 * Lagos time" is always exactly 22:59:59 UTC on the same calendar day
 * (or equivalently, the clinic's service lapses the instant it becomes
 * 23:00 UTC / midnight Lagos on the *next* day).
 */
export function nowInLagos(): Date {
  return toZonedTime(new Date(), LAGOS_TZ);
}

export function daysUntilInLagos(target: Date): number {
  const today = nowInLagos();
  const targetLagos = toZonedTime(target, LAGOS_TZ);
  return differenceInCalendarDays(targetLagos, today);
}

/** True once the clock has passed 23:59:59 Lagos time on subscriptionEnd's date. */
export function hasSubscriptionLapsed(subscriptionEnd: Date): boolean {
  return daysUntilInLagos(subscriptionEnd) < 0;
}

/** The exact reminder checkpoints required by the spec. */
export const REMINDER_CHECKPOINTS = [90, 60, 30, 20, 10] as const;
export type ReminderCheckpoint = (typeof REMINDER_CHECKPOINTS)[number];
