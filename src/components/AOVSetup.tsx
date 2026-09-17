'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function StartAOVPrompt() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!value || Number(value) <= 0) return;
    setSaving(true);
    await fetch('/api/clinic/aov', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startAOV: Number(value) }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <Card className="mb-6 border-honey-300 bg-honey-100">
      <h2 className="mb-1 font-display text-base font-medium text-clinical-text">
        What was your average order value before MyGlowBack.AI?
      </h2>
      <p className="mb-3 text-sm text-clinical-muted">
        This is a one-time question — enter it once and it's saved permanently as your baseline,
        so you can see exactly how much the app moves the needle. This is the only chance to
        record it before your "before" number gets buried under real sales.
      </p>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="e.g. 12000"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-40"
        />
        <Button onClick={save} disabled={saving || !value}>
          {saving ? 'Saving…' : 'Save baseline'}
        </Button>
      </div>
    </Card>
  );
}

export function TargetAOVEditor({
  targetAOVMonthly,
  targetAOVQuarterly,
  targetAOVHalfYearly,
  targetAOVYearly,
}: {
  targetAOVMonthly: number | null;
  targetAOVQuarterly: number | null;
  targetAOVHalfYearly: number | null;
  targetAOVYearly: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({
    targetAOVMonthly: targetAOVMonthly ? String(targetAOVMonthly) : '',
    targetAOVQuarterly: targetAOVQuarterly ? String(targetAOVQuarterly) : '',
    targetAOVHalfYearly: targetAOVHalfYearly ? String(targetAOVHalfYearly) : '',
    targetAOVYearly: targetAOVYearly ? String(targetAOVYearly) : '',
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const payload: Record<string, number | null> = {};
    for (const [k, v] of Object.entries(values)) {
      payload[k] = v ? Number(v) : null;
    }
    await fetch('/api/clinic/aov', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-sage-700 underline underline-offset-2"
      >
        Set AOV targets
      </button>
    );
  }

  const fields: { key: keyof typeof values; label: string }[] = [
    { key: 'targetAOVMonthly', label: 'Monthly target' },
    { key: 'targetAOVQuarterly', label: 'Quarterly target' },
    { key: 'targetAOVHalfYearly', label: 'Half-year target' },
    { key: 'targetAOVYearly', label: 'Yearly target' },
  ];

  return (
    <Card className="mt-3">
      <h3 className="mb-3 text-sm font-medium text-clinical-text">
        Set your AOV targets — each one is independent, not just a multiple of the last
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-xs text-clinical-muted">{f.label}</label>
            <Input
              type="number"
              value={values[f.key]}
              onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save targets'}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}
