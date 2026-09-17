import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

const bodySchema = z.object({
  startAOV: z.number().positive().optional(),
  targetAOVMonthly: z.number().positive().nullable().optional(),
  targetAOVQuarterly: z.number().positive().nullable().optional(),
  targetAOVHalfYearly: z.number().positive().nullable().optional(),
  targetAOVYearly: z.number().positive().nullable().optional(),
});

export async function PATCH(req: Request) {
  const session = await requireRole(['CLINIC_ADMIN']);
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { startAOV, ...targets } = parsed.data;

  // startAOV is one-and-done: real server-side check, not just a UI that
  // stops asking after the first time. If it's already set, silently drop
  // any attempt to change it rather than erroring — the baseline shouldn't
  // move just because someone resubmits the same form.
  const clinic = await prisma.clinic.findUnique({
    where: { id: session.user.clinicId! },
    select: { startAOVSetAt: true },
  });

  await prisma.clinic.update({
    where: { id: session.user.clinicId! },
    data: {
      ...(startAOV !== undefined && !clinic?.startAOVSetAt
        ? { startAOV, startAOVSetAt: new Date() }
        : {}),
      ...targets,
    },
  });

  return NextResponse.json({ ok: true });
}
