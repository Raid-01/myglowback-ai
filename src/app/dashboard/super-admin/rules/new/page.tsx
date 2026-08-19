import { requireRole } from '@/lib/session';
import { RuleEditorForm, EMPTY_RULE_FORM } from '@/components/RuleEditorForm';

export default async function NewRulePage() {
  await requireRole(['SUPER_ADMIN']);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-medium text-clinical-text">New Rule</h1>
      <p className="mt-1 text-sm text-clinical-muted">
        Build a new routine from scratch — it becomes live the moment you save it.
      </p>
      <div className="mt-6">
        <RuleEditorForm initial={EMPTY_RULE_FORM} />
      </div>
    </div>
  );
}
