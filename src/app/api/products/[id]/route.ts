import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';

const CONCERNS = ['ACNE', 'HYPERPIGMENTATION', 'SUN_DAMAGE', 'AGING'] as const;

const bodySchema = z.object({
  name: z.string().min(2).optional(),
  brand: z.string().optional(),
  category: z.string().min(2).optional(),
  price: z.coerce.number().nonnegative().optional(),
  stockQuantity: z.coerce.number().int().nonnegative().optional(),
  activeIngredients: z.array(z.string()).optional(),
  concerns: z.array(z.enum(CONCERNS)).optional(),
  isUpsell: z.boolean().optional(),
});

async function assertOwnership(productId: string, clinicId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.clinicId !== clinicId) return null;
  return product;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  if (session.user.role !== 'CLINIC_ADMIN') {
    return NextResponse.json({ error: 'Only a Clinic Admin can edit products.' }, { status: 403 });
  }
  const existing = await assertOwnership(params.id, session.user.clinicId!);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.product.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  if (session.user.role !== 'CLINIC_ADMIN') {
    return NextResponse.json({ error: 'Only a Clinic Admin can delete products.' }, { status: 403 });
  }
  const existing = await assertOwnership(params.id, session.user.clinicId!);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
