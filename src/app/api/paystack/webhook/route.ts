import { NextResponse } from 'next/server';
import { addDays, addYears } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { isValidPaystackSignature } from '@/lib/paystack';
import { sendPaymentConfirmedEmail } from '@/lib/email';

/** True if `err` is a Prisma unique-constraint violation (P2002) on `field`.
 * Deliberately duck-typed on `err.code`/`err.meta.target` rather than an
 * `instanceof PrismaClientKnownRequestError` check — that class's import
 * path has moved between Prisma versions, and this check matters too much
 * (it's the thing preventing a webhook retry from double-processing a
 * payment) to have it silently stop working after a routine `npm update`. */
function isDuplicateKeyError(err: unknown, field: string): boolean {
  if (typeof err !== 'object' || err === null || !('code' in err)) return false;
  if ((err as { code?: unknown }).code !== 'P2002') return false;
  const target = (err as { meta?: { target?: unknown } }).meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  if (typeof target === 'string') return target.includes(field);
  return false;
}

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

    // --- Idempotency, fast path ---
    // Paystack can and will deliver the same webhook more than once (retries
    // on slow responses, non-2xx replies, or just their own at-least-once
    // delivery guarantee). Without this check, a retry would re-extend the
    // subscription a second time for a single payment. invoiceNumber is
    // derived 1:1 from the Paystack reference, so its existence IS the
    // record of "this charge was already processed."
    const invoiceNumber = `INV-${reference}`;
    const alreadyProcessed = await prisma.invoice.findUnique({ where: { invoiceNumber } });
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, note: 'Already processed — no action taken' });
    }

    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic) return NextResponse.json({ received: true, note: 'Clinic not found' });

    // Extend from "now" if the subscription/trial already lapsed, otherwise
    // extend from the current end date so early payments don't lose
    // remaining trial or paid-for time.
    const base = clinic.subscriptionEnd > new Date() ? clinic.subscriptionEnd : new Date();
    const newEnd = billingCycle === 'ANNUAL' ? addYears(base, 1) : addDays(base, 30);
    const paidAmount = amount / 100; // Paystack sends kobo

    try {
      await prisma.$transaction([
        prisma.clinic.update({
          where: { id: clinicId },
          // billingCycle is updated here too, not just subscriptionEnd —
          // the renew flow can now charge a different cycle than whatever
          // was previously stored (picking "yearly" at renewal time even
          // if the clinic was on monthly), so the stored value needs to
          // track whatever was actually just paid for, not go stale.
          data: { subscriptionEnd: newEnd, isActive: true, isTrialing: false, billingCycle },
        }),
        prisma.invoice.create({
          data: {
            invoiceNumber,
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
    } catch (err) {
      // --- Idempotency, safety net ---
      // Covers the race window between the check above and this write: two
      // near-simultaneous deliveries of the same webhook could both pass the
      // "already processed?" check before either has committed. If that
      // happens, the invoiceNumber's unique constraint makes the second
      // write fail here instead — which means the subscription extension in
      // the same transaction rolled back too (Prisma's array-form
      // $transaction is all-or-nothing), so nothing was double-applied.
      // That specific failure means "already handled," not "broken" — every
      // other error is a real failure and should surface as one.
      const isDuplicateInvoice = isDuplicateKeyError(err, 'invoiceNumber');

      if (isDuplicateInvoice) {
        return NextResponse.json({ received: true, note: 'Already processed — no action taken' });
      }
      console.error('Paystack webhook processing failed:', err);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }

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
