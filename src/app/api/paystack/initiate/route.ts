import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { initializeTransaction, naira, PRICING } from '@/lib/paystack';

export async function POST() {
  const session = await requireSession();
  if (!session.user.clinicId) {
    return NextResponse.json({ error: 'No clinic associated with this account.' }, { status: 400 });
  }

  const clinic = await prisma.clinic.findUniqueOrThrow({ where: { id: session.user.clinicId } });
  const amount = PRICING[clinic.billingCycle];
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
        billingCycle: clinic.billingCycle,
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
