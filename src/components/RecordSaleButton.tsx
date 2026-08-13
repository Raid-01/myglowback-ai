'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RecordSaleButton({
  patientId,
  assessmentId,
  productId,
  productName,
  defaultPrice,
}: {
  patientId: string;
  assessmentId: string;
  productId: string;
  productName: string;
  defaultPrice: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [amount, setAmount] = useState(defaultPrice ? String(defaultPrice) : '');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function record() {
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId,
        assessmentId,
        productId,
        productName,
        quantity: Number(quantity) || 1,
        amount: Number(amount),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setDone(true);
      setOpen(false);
      router.refresh();
    }
  }

  if (done) {
    return <span className="text-xs font-medium text-sage-700">✓ Recorded</span>;
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-medium text-sage-700">
        Record sale
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        type="number"
        className="h-8 w-14 text-xs"
        aria-label="Quantity"
      />
      <Input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        placeholder="₦ total"
        className="h-8 w-24 text-xs"
        aria-label="Total amount"
      />
      <Button type="button" size="sm" onClick={record} disabled={saving}>
        {saving ? '…' : 'Save'}
      </Button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-clinical-muted">
        Cancel
      </button>
    </div>
  );
}
