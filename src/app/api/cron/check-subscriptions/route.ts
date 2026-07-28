import { NextResponse } from 'next/server';
import {
  daysUntilInLagos,
  hasSubscriptionLapsed,
  REMINDER_CHECKPOINTS,
  TRIAL_REMINDER_CHECKPOINTS,
} from '@/lib/date';
import { prisma } from '@/lib/prisma';
import { sendRenewalReminderEmail } from '@/lib/email';

export const dynamic = 'force-dynamic'; // never statically cache a cron endpoint

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured — allow (local/dev)
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clinics = await prisma.clinic.findMany({ where: { isActive: true } });

  let deactivated = 0;
  let remindersSent = 0;

  for (const clinic of clinics) {
    // ── 1. Service cessation at 23:59:59 Lagos on subscriptionEnd's date ──
    // (this covers both a lapsed trial and a lapsed paid subscription —
    // same field, same cutoff logic, either way)
    if (hasSubscriptionLapsed(clinic.subscriptionEnd)) {
      await prisma.clinic.update({ where: { id: clinic.id }, data: { isActive: false } });
      deactivated++;
      continue; // an already-lapsed clinic doesn't need reminders
    }

    // ── 2. Reminder checkpoints — trials get 7/3/1 days, paid gets 90/60/30/20/10 ──
    const daysLeft = daysUntilInLagos(clinic.subscriptionEnd);
    const checkpoints = clinic.isTrialing ? TRIAL_REMINDER_CHECKPOINTS : REMINDER_CHECKPOINTS;
    if (!checkpoints.includes(daysLeft as never)) continue;

    const alreadySent = await prisma.notification.findFirst({
      where: { clinicId: clinic.id, daysUntilExpiry: daysLeft },
    });
    if (alreadySent) continue; // one notification per checkpoint per clinic

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const link = `${appUrl}/dashboard/billing`;
    const message = clinic.isTrialing
      ? `Your free trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`
      : `Your subscription renews in ${daysLeft} days.`;

    await prisma.notification.createMany({
      data: [
        { clinicId: clinic.id, type: 'DASHBOARD', sentAt: new Date(), daysUntilExpiry: daysLeft, message, link },
        { clinicId: clinic.id, type: 'EMAIL', sentAt: new Date(), daysUntilExpiry: daysLeft, message, link },
      ],
    });

    try {
      await sendRenewalReminderEmail({
        to: clinic.email,
        clinicName: clinic.name,
        daysUntilExpiry: daysLeft,
        renewUrl: link,
      });
    } catch (err) {
      console.error(`Failed to send reminder email to ${clinic.email}:`, err);
    }

    remindersSent++;
  }

  return NextResponse.json({ ok: true, checked: clinics.length, deactivated, remindersSent });
}
