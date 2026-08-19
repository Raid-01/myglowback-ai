'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const CONCERN_OPTIONS = ['ACNE', 'HYPERPIGMENTATION', 'SUN_DAMAGE', 'AGING', 'GLOWING_SKIN'];
const SEVERITY_OPTIONS = ['MILD', 'MODERATE', 'SEVERE'];
const SKIN_TYPE_OPTIONS = ['OILY', 'DRY', 'COMBINATION', 'SENSITIVE', 'NORMAL'];

function linesToArray(text: string): string[] {
  return text.split('\n').map((s) => s.trim()).filter(Boolean);
}

function CheckboxGroup({
  label,
  hint,
  options,
  selected,
  onChange,
}: {
  label: string;
  hint?: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {hint && <p className="mb-2 -mt-1 text-xs text-clinical-muted">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() =>
                onChange(active ? selected.filter((s) => s !== opt) : [...selected, opt])
              }
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                active
                  ? 'border-sage-500 bg-sage-50 text-sage-800'
                  : 'border-clinical-border bg-white text-clinical-text'
              }`}
            >
              {opt.replace(/_/g, ' ')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface RuleFormValues {
  name: string;
  concerns: string[];
  severity: string[];
  skinType: string[];
  avoidIngredients: string;
  amSteps: string;
  pmSteps: string;
  ingredients: string;
  upsells: string;
  followUpDays: string;
  requiresLicensedPharmacy: boolean;
  escalationNote: string;
}

export const EMPTY_RULE_FORM: RuleFormValues = {
  name: '',
  concerns: [],
  severity: [],
  skinType: [],
  avoidIngredients: '',
  amSteps: '',
  pmSteps: '',
  ingredients: '',
  upsells: '',
  followUpDays: '30',
  requiresLicensedPharmacy: false,
  escalationNote: '',
};

export function RuleEditorForm({
  ruleId,
  initial,
}: {
  ruleId?: string; // present when editing, absent when creating
  initial: RuleFormValues;
}) {
  const router = useRouter();
  const [v, setV] = useState<RuleFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof RuleFormValues>(key: K, value: RuleFormValues[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (v.name.trim().length < 3) {
      setError('Give this rule a real name — a few words is fine.');
      return;
    }
    if (v.concerns.length === 0) {
      setError('Select at least one condition this rule applies to.');
      return;
    }
    const amSteps = linesToArray(v.amSteps);
    const pmSteps = linesToArray(v.pmSteps);
    if (amSteps.length === 0 || pmSteps.length === 0) {
      setError('Both the morning and evening routine need at least one step.');
      return;
    }

    setError(null);
    setSaving(true);
    const payload = {
      name: v.name,
      concerns: v.concerns,
      severity: v.severity,
      skinType: v.skinType,
      avoidIngredients: linesToArray(v.avoidIngredients),
      amSteps,
      pmSteps,
      ingredients: linesToArray(v.ingredients),
      upsells: linesToArray(v.upsells),
      followUpDays: Number(v.followUpDays) || 30,
      requiresLicensedPharmacy: v.requiresLicensedPharmacy,
      escalationNote: v.escalationNote || undefined,
    };

    const res = await fetch(ruleId ? `/api/super-admin/rules/${ruleId}` : '/api/super-admin/rules', {
      method: ruleId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (!res.ok) {
      setError('Something went wrong saving this — try again.');
      return;
    }
    router.push('/dashboard/super-admin/rules');
    router.refresh();
  }

  async function remove() {
    if (!ruleId) return;
    if (!confirm(`Delete "${v.name}"? This can't be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/super-admin/rules/${ruleId}`, { method: 'DELETE' });
    router.push('/dashboard/super-admin/rules');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div>
          <Label htmlFor="rule-name">Rule name</Label>
          <Input
            id="rule-name"
            value={v.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Acne — Moderate"
          />
          <p className="mt-1 text-xs text-clinical-muted">
            Just for your own reference in this list — patients never see this.
          </p>
        </div>

        <CheckboxGroup
          label="Which condition(s) does this apply to?"
          options={CONCERN_OPTIONS}
          selected={v.concerns}
          onChange={(next) => set('concerns', next)}
        />

        <CheckboxGroup
          label="Which severity does this apply to?"
          hint="Leave all unticked for a rule that fits any severity — usually only Glowing Skin should do this."
          options={SEVERITY_OPTIONS}
          selected={v.severity}
          onChange={(next) => set('severity', next)}
        />

        <CheckboxGroup
          label="Which skin type does this apply to?"
          hint="Leave all unticked to apply regardless of skin type."
          options={SKIN_TYPE_OPTIONS}
          selected={v.skinType}
          onChange={(next) => set('skinType', next)}
        />

        <div>
          <Label htmlFor="avoid">Never recommend this rule if the patient is allergic to…</Label>
          <textarea
            id="avoid"
            value={v.avoidIngredients}
            onChange={(e) => set('avoidIngredients', e.target.value)}
            placeholder={'One ingredient per line, e.g.\nsalicylic acid\nfragrance'}
            rows={2}
            className="w-full rounded-xl border border-clinical-border bg-white px-4 py-2.5 text-sm text-clinical-text placeholder:text-clinical-muted focus:outline-none focus:ring-2 focus:ring-sage-400"
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="font-display text-base font-medium text-clinical-text">The routine</h3>
        <div>
          <Label htmlFor="am">Morning steps</Label>
          <textarea
            id="am"
            value={v.amSteps}
            onChange={(e) => set('amSteps', e.target.value)}
            placeholder={'One step per line, in order, e.g.\nGentle cleanser\nVitamin C serum\nSPF 30+'}
            rows={4}
            className="w-full rounded-xl border border-clinical-border bg-white px-4 py-2.5 text-sm text-clinical-text placeholder:text-clinical-muted focus:outline-none focus:ring-2 focus:ring-sage-400"
          />
        </div>
        <div>
          <Label htmlFor="pm">Evening steps</Label>
          <textarea
            id="pm"
            value={v.pmSteps}
            onChange={(e) => set('pmSteps', e.target.value)}
            placeholder={'One step per line, in order'}
            rows={4}
            className="w-full rounded-xl border border-clinical-border bg-white px-4 py-2.5 text-sm text-clinical-text placeholder:text-clinical-muted focus:outline-none focus:ring-2 focus:ring-sage-400"
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <Label htmlFor="ingredients">Key ingredients</Label>
          <textarea
            id="ingredients"
            value={v.ingredients}
            onChange={(e) => set('ingredients', e.target.value)}
            placeholder={'One per line, e.g.\nAzelaic Acid 10%\nNiacinamide 4–5%'}
            rows={3}
            className="w-full rounded-xl border border-clinical-border bg-white px-4 py-2.5 text-sm text-clinical-text placeholder:text-clinical-muted focus:outline-none focus:ring-2 focus:ring-sage-400"
          />
        </div>
        <div>
          <Label htmlFor="upsells">Suggested upsells</Label>
          <textarea
            id="upsells"
            value={v.upsells}
            onChange={(e) => set('upsells', e.target.value)}
            placeholder={'One per line — product names to suggest alongside this routine'}
            rows={2}
            className="w-full rounded-xl border border-clinical-border bg-white px-4 py-2.5 text-sm text-clinical-text placeholder:text-clinical-muted focus:outline-none focus:ring-2 focus:ring-sage-400"
          />
        </div>
        <div>
          <Label htmlFor="followup">Follow up after how many days?</Label>
          <Input
            id="followup"
            type="number"
            value={v.followUpDays}
            onChange={(e) => set('followUpDays', e.target.value)}
            className="w-32"
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="font-display text-base font-medium text-clinical-text">
          Prescription-tier gate
        </h3>
        <p className="text-sm text-clinical-muted">
          Only tick this for a rule that names a genuinely prescription-strength option (like
          hydroquinone above 2%, or a compounded formula). Ticking this means only clinics a
          Super Admin has verified as a licensed pharmacy will ever see this rule — everyone
          else never sees it at all, not even greyed out.
        </p>
        <label className="flex items-center gap-2 text-sm text-clinical-text">
          <input
            type="checkbox"
            checked={v.requiresLicensedPharmacy}
            onChange={(e) => set('requiresLicensedPharmacy', e.target.checked)}
            className="h-4 w-4 rounded border-clinical-border"
          />
          This rule requires a verified pharmacy
        </label>
        <div>
          <Label htmlFor="escalation">Escalation note (optional)</Label>
          <textarea
            id="escalation"
            value={v.escalationNote}
            onChange={(e) => set('escalationNote', e.target.value)}
            placeholder="Shown alongside the routine — e.g. when to refer to a dermatologist, or what a pharmacist should discuss with a prescribing physician."
            rows={3}
            className="w-full rounded-xl border border-clinical-border bg-white px-4 py-2.5 text-sm text-clinical-text placeholder:text-clinical-muted focus:outline-none focus:ring-2 focus:ring-sage-400"
          />
        </div>
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center justify-between">
        <div>
          {ruleId && (
            <button
              type="button"
              onClick={remove}
              disabled={deleting}
              className="text-sm font-medium text-danger"
            >
              {deleting ? 'Deleting…' : 'Delete this rule'}
            </button>
          )}
        </div>
        <Button type="button" size="lg" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : ruleId ? 'Save changes' : 'Create rule'}
        </Button>
      </div>
    </div>
  );
}
