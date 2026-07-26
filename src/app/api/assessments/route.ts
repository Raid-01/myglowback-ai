import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { matchAssessmentToRoutine } from '@/lib/matching-engine';

const CONCERNS = ['ACNE', 'HYPERPIGMENTATION', 'SUN_DAMAGE', 'AGING'] as const;

const bodySchema = z.object({
  patientId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  skinType: z.enum(['OILY', 'DRY', 'COMBINATION', 'SENSITIVE', 'NORMAL']),
  concerns: z.array(z.enum(CONCERNS)).min(1, 'Select at least one of the 4 core concerns'),
  allergies: z.string().optional(),
  goals: z.string().optional(),
  ageRange: z
    .enum(['UNDER_18', 'AGE_18_25', 'AGE_26_35', 'AGE_36_45', 'AGE_46_55', 'AGE_55_PLUS'])
    .optional(),
});

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session.user.clinicId) {
    return NextResponse.json({ error: 'No clinic on this account.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const clinicId = session.user.clinicId;

  let patientId = data.patientId;
  if (!patientId) {
    if (!data.firstName || !data.lastName || !data.phone) {
      return NextResponse.json(
        { error: 'firstName, lastName, and phone are required for a new patient.' },
        { status: 400 }
      );
    }
    const patient = await prisma.patient.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email || undefined,
        clinicId,
      },
    });
    patientId = patient.id;
  }

  const match = await matchAssessmentToRoutine({
    clinicId,
    skinType: data.skinType,
    concerns: data.concerns,
    allergies: data.allergies,
  });

  const assessment = await prisma.assessment.create({
    data: {
      patientId,
      staffId: session.user.id,
      clinicId,
      skinType: data.skinType,
      concerns: data.concerns,
      allergies: data.allergies,
      goals: data.goals,
      ageRange: data.ageRange,
      recommendedRoutine: match.routine,
      recommendedIngredients: match.ingredients,
      matchedProducts: match.matchedProducts.map((p) => p.id),
      suggestedUpsells: match.upsells,
      followUpDate: match.followUpDate,
    },
  });

  return NextResponse.json({ id: assessment.id });
}
