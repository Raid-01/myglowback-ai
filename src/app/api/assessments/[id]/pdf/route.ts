import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { renderPrescriptionPdf } from '@/lib/pdf';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    include: { patient: true, clinic: true },
  });

  if (!assessment || (session.user.role !== 'SUPER_ADMIN' && assessment.clinicId !== session.user.clinicId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const routine = assessment.recommendedRoutine as unknown as { am: string[]; pm: string[] };

  const pdfBuffer = await renderPrescriptionPdf({
    patientName: `${assessment.patient.firstName} ${assessment.patient.lastName}`,
    clinicName: assessment.clinic.name,
    skinType: assessment.skinType,
    concerns: assessment.concerns,
    routine,
    ingredients: assessment.recommendedIngredients,
    followUpDate: assessment.followUpDate?.toLocaleDateString('en-NG') ?? 'Not scheduled',
    createdAt: assessment.createdAt.toLocaleDateString('en-NG'),
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="protocol-${assessment.patient.lastName}.pdf"`,
    },
  });
}
