import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PatientTable } from '@/components/PatientTable';

export default async function PatientsPage() {
  const session = await requireSession();
  const patients = await prisma.patient.findMany({
    where: { clinicId: session.user.clinicId! },
    include: { _count: { select: { assessments: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-clinical-text">Patients</h1>
      <p className="mb-6 text-sm text-clinical-muted">
        {patients.length} patient{patients.length === 1 ? '' : 's'} on record.
      </p>
      <PatientTable patients={patients} />
    </div>
  );
}
