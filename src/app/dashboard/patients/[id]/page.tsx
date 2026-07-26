import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();

  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: { assessments: { orderBy: { createdAt: 'desc' } } },
  });

  if (!patient || patient.clinicId !== session.user.clinicId) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-medium text-clinical-text">
        {patient.firstName} {patient.lastName}
      </h1>
      <p className="mt-1 text-sm text-clinical-muted">
        {patient.phone} {patient.email && `· ${patient.email}`}
      </p>

      <h2 className="mt-8 mb-3 font-display text-lg font-medium text-clinical-text">
        Assessment history
      </h2>

      {patient.assessments.length === 0 ? (
        <p className="text-sm text-clinical-muted">No assessments yet for this patient.</p>
      ) : (
        <div className="space-y-3">
          {patient.assessments.map((a) => (
            <Link key={a.id} href={`/dashboard/assessments/${a.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {a.concerns.map((c) => (
                      <Badge key={c} tone="sage">
                        {c.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-xs text-clinical-muted">
                    {a.createdAt.toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {a.followUpDate && (
                  <p className="mt-2 text-xs text-clinical-muted">
                    Follow-up: {a.followUpDate.toLocaleDateString('en-NG')}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
