import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export async function GET() {
  await requireRole(['SUPER_ADMIN']);
  const rules = await prisma.skincareRule.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ rules });
}

// Everything here is a plain string/array in the request — the multi-line
// textareas in the editor UI get split into arrays client-side before
// this ever sees them, so this route stays simple regardless of how the
// form is laid out.
const bodySchema = z.object({
  name: z.string().min(3),
  concerns: z.array(z.string()).min(1),
  severity: z.array(z.string()), // empty = applies at any severity
  skinType: z.array(z.string()), // empty = applies to any skin type
  avoidIngredients: z.array(z.string()),
  amSteps: z.array(z.string()).min(1),
  pmSteps: z.array(z.string()).min(1),
  ingredients: z.array(z.string()),
  upsells: z.array(z.string()),
  followUpDays: z.number().int().positive(),
  requiresLicensedPharmacy: z.boolean(),
  escalationNote: z.string().optional(),
});

export async function POST(req: Request) {
  await requireRole(['SUPER_ADMIN']);

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const rule = await prisma.skincareRule.create({
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

  return NextResponse.json({ id: rule.id });
}
