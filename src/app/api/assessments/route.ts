import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { matchAssessmentToRoutine } from '@/lib/matching-engine';

const CONCERNS = ['ACNE', 'HYPERPIGMENTATION', 'SUN_DAMAGE', 'AGING', 'GLOWING_SKIN'] as const;
const SEVERITIES = ['MILD', 'MODERATE', 'SEVERE'] as const;

const bodySchema = z.object({
  patientId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  biologicalSex: z.enum(['FEMALE', 'MALE', 'INTERSEX_OR_OTHER', 'UNDISCLOSED']).optional(),
  skinType: z.enum(['OILY', 'DRY', 'COMBINATION', 'SENSITIVE', 'NORMAL']),
  sensitiveOverlay: z.boolean().optional(),
  fitzpatrickType: z.enum(['TYPE_I', 'TYPE_II', 'TYPE_III', 'TYPE_IV', 'TYPE_V', 'TYPE_VI']).optional(),
  concerns: z.array(z.enum(CONCERNS)).min(1, 'Select at least one of the 5 core concerns'),
  severityByConcern: z.record(z.enum(SEVERITIES)).optional(), // keyed by Concern value
  allergies: z.string().optional(),
  knownSkinConditions: z.string().optional(),
  currentMedications: z.string().optional(),
  previousTreatments: z.string().optional(),
  goals: z.string().optional(),
  ageRange: z
    .enum(['UNDER_18', 'AGE_18_25', 'AGE_26_35', 'AGE_36_45', 'AGE_46_55', 'AGE_55_PLUS'])
    .optional(),
  // --- Hard-safety intake fields ---
  pregnancyStatus: z
    .enum(['PREGNANT', 'BREASTFEEDING', 'TRYING_TO_CONCEIVE', 'NONE', 'NOT_APPLICABLE'])
    .optional(),
  hormonalStage: z
    .enum(['PUBERTY', 'REPRODUCTIVE', 'PERIMENOPAUSAL', 'MENOPAUSAL', 'POST_MENOPAUSAL', 'NOT_APPLICABLE'])
    .optional(),
  onHormonalContraceptionOrHRT: z.boolean().optional(),
  cycleRelatedFlares: z.boolean().optional(),
  hotFlashesOrNightSweats: z.boolean().optional(),
  recentSkinTextureChange: z.boolean().optional(),
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
        biologicalSex: data.biologicalSex,
        clinicId,
      },
    });
    patientId = patient.id;
  } else {
    // Confirm this patient actually belongs to the requesting clinic —
    // never trust a client-supplied ID without checking ownership.
    const owned = await prisma.patient.findFirst({ where: { id: patientId, clinicId } });
    if (!owned) {
      return NextResponse.json({ error: 'Patient not found for this clinic.' }, { status: 404 });
    }
  }

  const match = await matchAssessmentToRoutine({
    clinicId,
    skinType: data.skinType,
    concerns: data.concerns,
    allergies: data.allergies,
    ageRange: data.ageRange,
    pregnancyStatus: data.pregnancyStatus,
    severityByConcern: data.severityByConcern,
  });

  const assessment = await prisma.assessment.create({
    data: {
      patientId,
      staffId: session.user.id,
      clinicId,
      skinType: data.skinType,
      sensitiveOverlay: data.sensitiveOverlay ?? false,
      fitzpatrickType: data.fitzpatrickType,
      concerns: data.concerns,
      severityByConcern: data.severityByConcern,
      allergies: data.allergies,
      knownSkinConditions: data.knownSkinConditions,
      currentMedications: data.currentMedications,
      previousTreatments: data.previousTreatments,
      goals: data.goals,
      ageRange: data.ageRange,
      pregnancyStatus: data.pregnancyStatus,
      hormonalStage: data.hormonalStage,
      onHormonalContraceptionOrHRT: data.onHormonalContraceptionOrHRT ?? false,
      cycleRelatedFlares: data.cycleRelatedFlares ?? false,
      hotFlashesOrNightSweats: data.hotFlashesOrNightSweats ?? false,
      recentSkinTextureChange: data.recentSkinTextureChange ?? false,
      recommendedRoutine: match.routine,
      recommendedIngredients: match.ingredients,
      matchedProducts: match.matchedProducts.map((p) => p.id),
      suggestedUpsells: match.upsells,
      safetyBlockedIngredients: match.safetyBlockedIngredients,
      escalationNote: match.escalationNote,
      followUpDate: match.followUpDate,
    },
  });

  return NextResponse.json({ id: assessment.id, escalationNote: match.escalationNote });
}
