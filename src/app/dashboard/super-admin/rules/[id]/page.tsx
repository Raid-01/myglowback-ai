import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { RuleEditorForm, type RuleFormValues } from '@/components/RuleEditorForm';

interface RuleCondition {
  concerns?: string[];
  severity?: string[];
  skinType?: string[];
  avoidIngredients?: string[];
}
interface RuleRoutine {
  am?: string[];
  pm?: string[];
}

export default async function EditRulePage({ params }: { params: { id: string } }) {
  await requireRole(['SUPER_ADMIN']);
  const rule = await prisma.skincareRule.findUnique({ where: { id: params.id } });
  if (!rule) notFound();

  const condition = rule.condition as RuleCondition;
  const routine = rule.routine as RuleRoutine;

  const initial: RuleFormValues = {
    name: rule.name,
    concerns: condition.concerns ?? [],
    severity: condition.severity ?? [],
    skinType: condition.skinType ?? [],
    avoidIngredients: (condition.avoidIngredients ?? []).join('\n'),
    amSteps: (routine.am ?? []).join('\n'),
    pmSteps: (routine.pm ?? []).join('\n'),
    ingredients: rule.ingredients.join('\n'),
    upsells: rule.upsells.join('\n'),
    followUpDays: String(rule.followUpDays),
    requiresLicensedPharmacy: rule.requiresLicensedPharmacy,
    escalationNote: rule.escalationNote ?? '',
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-medium text-clinical-text">Edit Rule</h1>
      <p className="mt-1 text-sm text-clinical-muted">
        Changes go live for every clinic the moment you save.
      </p>
      <div className="mt-6">
        <RuleEditorForm ruleId={rule.id} initial={initial} />
      </div>
    </div>
  );
}
