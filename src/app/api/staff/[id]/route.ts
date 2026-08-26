import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

const bodySchema = z.object({
  staffType: z.enum(['PHARMACIST', 'SUPPORT_STAFF']).nullable(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireRole(['CLINIC_ADMIN']);

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Real security boundary: a Clinic Admin can only tag someone at their
  // own clinic, never by guessing another clinic's user id.
  const target = await prisma.user.findFirst({
    where: { id: params.id, clinicId: session.user.clinicId! },
  });
  if (!target) {
    return NextResponse.json({ error: 'Staff member not found for this clinic.' }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: params.id },
    data: { staffType: parsed.data.staffType },
  });

  return NextResponse.json({ ok: true });
}
