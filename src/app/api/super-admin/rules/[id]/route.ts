import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await requireRole(['SUPER_ADMIN']);
  const rule = await prisma.skincareRule.findUnique({ where: { id: params.id } });
  if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ rule });
}

const bodySchema = z.object({
  name: z.string().min(3),
  concerns: z.array(z.string()).min(1),
  severity: z.array(z.string()),
  skinType: z.array(z.string()),
  avoidIngredients: z.array(z.string()),
  amSteps: z.array(z.string()).min(1),
  pmSteps: z.array(z.string()).min(1),
  ingredients: z.array(z.string()),
  upsells: z.array(z.string()),
  followUpDays: z.number().int().positive(),
  requiresLicensedPharmacy: z.boolean(),
  escalationNote: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireRole(['SUPER_ADMIN']);

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  await prisma.skincareRule.update({
    where: { id: params.id },
    data: {
      name: d.name,
      condition: {
        concerns: d.concerns,
        ...(d.severity.length > 0 && { severity: d.severity }),
        ...(d.skinType.length > 0 && { skinType: d.skinType }),
        ...(d.avoidIngredients.length > 0 && { avoidIngredients: d.avoidIngredients }),
      },
      routine: { am: d.amSteps, pm: d.pmSteps },
      ingredients: d.ingredients,
      upsells: d.upsells,
      followUpDays: d.followUpDays,
      requiresLicensedPharmacy: d.requiresLicensedPharmacy,
      escalationNote: d.escalationNote || null,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await requireRole(['SUPER_ADMIN']);
  await prisma.skincareRule.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
