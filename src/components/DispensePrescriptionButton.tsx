'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function DispensePrescriptionButton({
  patientId,
  assessmentId,
  itemName,
}: {
  patientId: string;
  assessmentId: string;
  itemName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function record() {
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);
    setError(null);
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId,
        assessmentId,
        productName: itemName,
        amount: Number(amount),
        isPrescriptionTierDispense: true,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? 'Could not record this — check the pharmacist tag on your account.');
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) return <span className="text-xs font-medium text-sage-700">Dispensed ✓</span>;

  if (!open) {
    return (
      <Button size="sm" variant="primary" onClick={() => setOpen(true)}>
        Dispense
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        placeholder="Amount (₦)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-28"
      />
      <Button size="sm" variant="primary" onClick={record} disabled={saving}>
        {saving ? 'Saving…' : 'Confirm'}
      </Button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
