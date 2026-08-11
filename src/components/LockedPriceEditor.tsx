'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNaira } from '@/lib/utils';

export function LockedPriceEditor({
  clinicId,
  initialAnnual,
  initialMonthly,
}: {
  clinicId: string;
  initialAnnual: number | null;
  initialMonthly: number | null;
}) {
  const [editing, setEditing] = useState(false);
  const [annual, setAnnual] = useState(initialAnnual?.toString() ?? '');
  const [monthly, setMonthly] = useState(initialMonthly?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ annual: number | null; monthly: number | null }>({
    annual: initialAnnual,
    monthly: initialMonthly,
  });

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/super-admin/clinics/${clinicId}/locked-price`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lockedAnnualPrice: annual === '' ? null : Number(annual),
        lockedMonthlyPrice: monthly === '' ? null : Number(monthly),
      }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setSaved({ annual: data.lockedAnnualPrice, monthly: data.lockedMonthlyPrice });
      setEditing(false);
    }
  }

  function clear() {
    setAnnual('');
    setMonthly('');
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        {saved.annual || saved.monthly ? (
          <span className="rounded-full bg-honey-50 px-2 py-0.5 text-xs font-medium text-honey-700">
            Locked: {saved.annual ? `${formatNaira(saved.annual)}/yr` : ''}
            {saved.annual && saved.monthly ? ' · ' : ''}
            {saved.monthly ? `${formatNaira(saved.monthly)}/mo` : ''}
          </span>
        ) : (
          <span className="text-xs text-clinical-muted">Standard rate</span>
        )}
        <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-sage-700">
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Input
          value={annual}
          onChange={(e) => setAnnual(e.target.value)}
          placeholder="Annual ₦"
          className="h-8 w-28 text-xs"
          type="number"
        />
        <Input
          value={monthly}
          onChange={(e) => setMonthly(e.target.value)}
          placeholder="Monthly ₦"
          className="h-8 w-28 text-xs"
          type="number"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <button type="button" onClick={clear} className="text-xs text-clinical-muted">
          Clear both
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-xs text-clinical-muted">
          Cancel
        </button>
      </div>
    </div>
  );
}
