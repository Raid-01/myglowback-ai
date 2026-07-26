import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { daysUntilInLagos } from '@/lib/date';

const bodySchema = z.object({ billingCycle: z.enum(['ANNUAL', 'MONTHLY']) });

export async function PATCH(req: Request) {
  const session = await requireRole(['CLINIC_ADMIN']);
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const clinic = await prisma.clinic.findUniqueOrThrow({ where: { id: session.user.clinicId! } });
  const daysLeft = daysUntilInLagos(clinic.subscriptionEnd);

  // "Only allowed at renewal time" — i.e. once the current cycle is within
  // its final 10 days or has already lapsed.
  const atRenewalWindow = daysLeft <= 10;
  if (!atRenewalWindow) {
    return NextResponse.json(
      { error: `Billing cycle can only be changed within 10 days of renewal (${daysLeft} days left).` },
      { status: 400 }
    );
  }

  const updated = await prisma.clinic.update({
    where: { id: clinic.id },
    data: { billingCycle: parsed.data.billingCycle },
  });

  return NextResponse.json(updated);
}
