import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNaira } from '@/lib/utils';

export default async function AssessmentDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    include: { patient: true },
  });

  if (!assessment || assessment.clinicId !== session.user.clinicId) notFound();

  const routine = assessment.recommendedRoutine as unknown as { am: string[]; pm: string[] };
  const matchedProducts = await prisma.product.findMany({
    where: { id: { in: assessment.matchedProducts } },
  });

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-clinical-text">
            {assessment.patient.firstName} {assessment.patient.lastName}
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {assessment.concerns.map((c) => (
              <Badge key={c} tone="sage">
                {c.replace('_', ' ')}
              </Badge>
            ))}
            <Badge tone="neutral">{assessment.skinType}</Badge>
          </div>
        </div>
        <a href={`/api/assessments/${assessment.id}/pdf`}>
          <Button variant="secondary">Generate PDF</Button>
        </a>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-base font-medium text-clinical-text">
            AM Routine
          </h2>
          <ol className="space-y-2">
            {routine.am.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-clinical-text">
                <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-sage-600 text-[11px] font-semibold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <h2 className="mb-3 font-display text-base font-medium text-clinical-text">
            PM Routine
          </h2>
          <ol className="space-y-2">
            {routine.pm.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-clinical-text">
                <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-sage-700 text-[11px] font-semibold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="mb-3 font-display text-base font-medium text-clinical-text">
          Key active ingredients
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {assessment.recommendedIngredients.map((ing) => (
            <Badge key={ing} tone="honey">
              {ing}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="mb-3 font-display text-base font-medium text-clinical-text">
          Matched products in stock
        </h2>
        {matchedProducts.length === 0 ? (
          <p className="text-sm text-clinical-muted">
            No exact stock matches — check the Inventory tab to restock relevant products.
          </p>
        ) : (
          <ul className="divide-y divide-clinical-border">
            {matchedProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-clinical-text">{p.name}</span>
                <span className="text-clinical-muted">{p.price ? formatNaira(p.price) : '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {assessment.suggestedUpsells.length > 0 && (
        <Card className="mt-6">
          <h2 className="mb-3 font-display text-base font-medium text-clinical-text">
            Suggested upsells
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {assessment.suggestedUpsells.map((u) => (
              <Badge key={u} tone="neutral">
                {u}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-6">
        <h2 className="mb-1 font-display text-base font-medium text-clinical-text">Follow-up</h2>
        <p className="text-sm text-clinical-text">
          {assessment.followUpDate?.toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </Card>
    </div>
  );
}
