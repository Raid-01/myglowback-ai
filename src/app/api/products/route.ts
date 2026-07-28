import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';

const CONCERNS = ['ACNE', 'HYPERPIGMENTATION', 'SUN_DAMAGE', 'AGING'] as const;

const bodySchema = z.object({
  name: z.string().min(2),
  brand: z.string().optional(),
  category: z.string().min(2),
  price: z.coerce.number().nonnegative().optional(),
  stockQuantity: z.coerce.number().int().nonnegative().default(0),
  activeIngredients: z.array(z.string()).default([]),
  concerns: z.array(z.enum(CONCERNS)).min(1),
  isUpsell: z.boolean().default(false),
});

export async function GET() {
  const session = await requireSession();
  const products = await prisma.product.findMany({
    where: { clinicId: session.user.clinicId! },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (session.user.role !== 'CLINIC_ADMIN') {
    return NextResponse.json({ error: 'Only a Clinic Admin can add products.' }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const product = await prisma.product.create({
    data: { ...parsed.data, clinicId: session.user.clinicId! },
  });
  return NextResponse.json(product);
}
