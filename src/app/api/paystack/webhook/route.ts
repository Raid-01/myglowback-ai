import { NextResponse } from 'next/server';
import { addDays, addYears } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { isValidPaystackSignature } from '@/lib/paystack';
import { sendPaymentConfirmedEmail } from '@/lib/email';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  if (!isValidPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'charge.success') {
    const { metadata, amount, reference } = event.data;
    const clinicId: string | undefined = metadata?.clinicId;
    const billingCycle: 'ANNUAL' | 'MONTHLY' | undefined = metadata?.billingCycle;

    if (!clinicId || !billingCycle) {
      return NextResponse.json({ received: true, note: 'No clinic metadata — ignored' });
    }

    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic) return NextResponse.json({ received: true, note: 'Clinic not found' });

    // Extend from "now" if the subscription/trial already lapsed, otherwise
    // extend from the current end date so early payments don't lose
    // remaining trial or paid-for time.
    const base = clinic.subscriptionEnd > new Date() ? clinic.subscriptionEnd : new Date();
    const newEnd = billingCycle === 'ANNUAL' ? addYears(base, 1) : addDays(base, 30);
    const paidAmount = amount / 100; // Paystack sends kobo

    await prisma.$transaction([
      prisma.clinic.update({
        where: { id: clinicId },
        data: { subscriptionEnd: newEnd, isActive: true, isTrialing: false },
      }),
      prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${reference}`,
          clinicId,
          amount: paidAmount,
          totalDue: paidAmount,
          status: 'PAID',
          dueDate: new Date(),
          paidAt: new Date(),
        },
      }),
      // Payment resolves any outstanding trial/renewal reminders for this clinic.
      prisma.notification.updateMany({
        where: { clinicId, isSeen: false },
        data: { isSeen: true },
      }),
    ]);

    try {
      await sendPaymentConfirmedEmail({
        to: clinic.email,
        clinicName: clinic.name,
        amount: paidAmount,
        billingCycle,
        newSubscriptionEnd: newEnd,
      });
    } catch (err) {
      console.error('Payment confirmation email failed to send:', err);
    }
  }

  return NextResponse.json({ received: true });
}
