import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

const bodySchema = z.object({
  lockedAnnualPrice: z.number().positive().nullable(),
  lockedMonthlyPrice: z.number().positive().nullable(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireRole(['SUPER_ADMIN']);

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const clinic = await prisma.clinic.update({
    where: { id: params.id },
    data: {
      lockedAnnualPrice: parsed.data.lockedAnnualPrice,
      lockedMonthlyPrice: parsed.data.lockedMonthlyPrice,
    },
  });

  return NextResponse.json({
    lockedAnnualPrice: clinic.lockedAnnualPrice,
    lockedMonthlyPrice: clinic.lockedMonthlyPrice,
  });
}
