import { NextResponse } from 'next/server';
import { addDays, addYears } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { isValidPaystackSignature } from '@/lib/paystack';

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

    // Extend from "now" if the subscription already lapsed, otherwise extend
    // from the current end date so early renewals don't lose paid-for time.
    const base = clinic.subscriptionEnd > new Date() ? clinic.subscriptionEnd : new Date();
    const newEnd = billingCycle === 'ANNUAL' ? addYears(base, 1) : addDays(base, 30);

    await prisma.$transaction([
      prisma.clinic.update({
        where: { id: clinicId },
        data: { subscriptionEnd: newEnd, isActive: true },
      }),
      prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${reference}`,
          clinicId,
          amount: amount / 100, // Paystack sends kobo
          totalDue: amount / 100,
          status: 'PAID',
          dueDate: new Date(),
          paidAt: new Date(),
        },
      }),
      // A renewal resolves any outstanding reminders for this clinic.
      prisma.notification.updateMany({
        where: { clinicId, isSeen: false },
        data: { isSeen: true },
      }),
    ]);
  }

  return NextResponse.json({ received: true });
}
