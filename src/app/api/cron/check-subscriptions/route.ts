import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { daysUntilInLagos, hasSubscriptionLapsed, REMINDER_CHECKPOINTS } from '@/lib/date';
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
    if (hasSubscriptionLapsed(clinic.subscriptionEnd)) {
      await prisma.clinic.update({ where: { id: clinic.id }, data: { isActive: false } });
      deactivated++;
      continue; // an already-lapsed clinic doesn't need renewal reminders
    }

    // ── 2. Reminder checkpoints: 90 / 60 / 30 / 20 / 10 days out ────────
    const daysLeft = daysUntilInLagos(clinic.subscriptionEnd);
    if (!REMINDER_CHECKPOINTS.includes(daysLeft as any)) continue;

    const alreadySent = await prisma.notification.findFirst({
      where: { clinicId: clinic.id, daysUntilExpiry: daysLeft },
    });
    if (alreadySent) continue; // one notification per checkpoint per clinic

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const link = `${appUrl}/dashboard/billing`;
    const message = `Your subscription renews in ${daysLeft} days.`;

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
