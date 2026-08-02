import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { AssessmentForm } from '@/components/AssessmentForm';

export default async function NewAssessmentPage() {
  const session = await requireSession();
  const patients = await prisma.patient.findMany({
    where: { clinicId: session.user.clinicId! },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: 'asc' },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-medium text-clinical-text">New Assessment</h1>
      <p className="mt-1 text-sm text-clinical-muted">
        A short guided assessment — acne, hyperpigmentation, sun damage, aging, and general glow.
      </p>
      <div className="mt-6">
        <AssessmentForm patients={patients} />
      </div>
    </div>
  );
}
