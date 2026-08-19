import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { initializeTransaction, naira, PRICING } from '@/lib/paystack';

export async function POST(req: Request) {
  const session = await requireSession();
  if (session.user.role !== 'CLINIC_ADMIN') {
    return NextResponse.json({ error: 'Only a Clinic Admin can manage billing.' }, { status: 403 });
  }
  if (!session.user.clinicId) {
    return NextResponse.json({ error: 'No clinic associated with this account.' }, { status: 400 });
  }

  // Optional override — lets the "Renew Now" flow charge whichever cycle
  // the person picks right at that moment (yearly by default, or monthly
  // if they choose it) without needing a separate "switch cycle" step
  // first. Falls back to the clinic's currently stored cycle if omitted,
  // so the existing "switch billing cycle" buttons on the billing page
  // keep working exactly as before.
  const body = await req.json().catch(() => ({}));
  const billingCycle: 'ANNUAL' | 'MONTHLY' =
    body?.billingCycle === 'ANNUAL' || body?.billingCycle === 'MONTHLY' ? body.billingCycle : undefined;

  const clinic = await prisma.clinic.findUniqueOrThrow({ where: { id: session.user.clinicId } });
  const cycle = billingCycle ?? clinic.billingCycle;
  // A locked price (early-bird or negotiated) always wins over the standard
  // rate. Both locked fields are null for the normal case, so this falls
  // straight through to standard pricing for everyone without one.
  const lockedPrice = cycle === 'ANNUAL' ? clinic.lockedAnnualPrice : clinic.lockedMonthlyPrice;
  const amount = lockedPrice ?? PRICING[cycle];
  const reference = `MGB-${clinic.id}-${Date.now()}`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  try {
    const result = await initializeTransaction({
      email: clinic.email,
      amountKobo: naira(amount),
      reference,
      callbackUrl: `${appUrl}/dashboard/billing?ref=${reference}`,
      metadata: {
        clinicId: clinic.id,
        billingCycle: cycle,
        purpose: 'subscription_renewal',
      },
    });

    return NextResponse.json({ authorization_url: result.data.authorization_url });
  } catch (err) {
    console.error('Paystack initiate failed:', err);
    return NextResponse.json(
      { error: "Payment isn't set up yet — Paystack keys need to be added before this works." },
      { status: 503 }
    );
  }
}
