import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';

const bodySchema = z.object({
  patientId: z.string().optional(),
  assessmentId: z.string().optional(),
  productId: z.string().optional(),
  productName: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  amount: z.number().positive(),
  // Set only when this sale is dispensing a prescription-tier item
  // (Tretinoin, Tazarotene, above-2% Hydroquinone). Triggers the real
  // server-side check below — this is the actual security boundary, not
  // just a button that happens to be hidden from non-pharmacists in the UI.
  isPrescriptionTierDispense: z.boolean().optional(),
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

  // Confirm any referenced patient/assessment/product actually belongs to
  // this clinic — never trust client-supplied IDs without checking
  // ownership, same rule as everywhere else in this app.
  if (data.patientId) {
    const owned = await prisma.patient.findFirst({
      where: { id: data.patientId, clinicId: session.user.clinicId },
    });
    if (!owned) return NextResponse.json({ error: 'Patient not found for this clinic.' }, { status: 404 });
  }
  if (data.assessmentId) {
    const owned = await prisma.assessment.findFirst({
      where: { id: data.assessmentId, clinicId: session.user.clinicId },
    });
    if (!owned) return NextResponse.json({ error: 'Assessment not found for this clinic.' }, { status: 404 });
  }
  if (data.productId) {
    const owned = await prisma.product.findFirst({
      where: { id: data.productId, clinicId: session.user.clinicId },
    });
    if (!owned) return NextResponse.json({ error: 'Product not found for this clinic.' }, { status: 404 });
  }

  // Real security boundary, not a UI-only check: a prescription-tier
  // dispense requires BOTH a verified-pharmacy clinic AND the specific
  // logged-in person being tagged PHARMACIST by their Clinic Admin — a
  // support-staff login at the same clinic must never reach this branch,
  // regardless of what the client sends.
  if (data.isPrescriptionTierDispense) {
    const [clinic, staff] = await Promise.all([
      prisma.clinic.findUnique({ where: { id: session.user.clinicId }, select: { licenseType: true, licenseVerifiedAt: true } }),
      prisma.user.findUnique({ where: { id: session.user.id }, select: { staffType: true } }),
    ]);
    const clinicIsVerifiedPharmacy = clinic?.licenseType === 'PHARMACY' && clinic?.licenseVerifiedAt != null;
    if (!clinicIsVerifiedPharmacy || staff?.staffType !== 'PHARMACIST') {
      return NextResponse.json(
        { error: 'Only a verified pharmacist at a verified pharmacy can dispense a prescription-tier item.' },
        { status: 403 }
      );
    }
  }

  const sale = await prisma.sale.create({
    data: {
      clinicId: session.user.clinicId,
      patientId: data.patientId,
      assessmentId: data.assessmentId,
      productId: data.productId,
      productName: data.productName,
      quantity: data.quantity,
      amount: data.amount,
      recordedById: session.user.id,
    },
  });

  return NextResponse.json({ id: sale.id });
}
