'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from '@/components/ui/input';

export function StaffTypeSelect({
  userId,
  currentValue,
}: {
  userId: string;
  currentValue: 'PHARMACIST' | 'SUPPORT_STAFF' | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentValue ?? '');
  const [saving, setSaving] = useState(false);

  async function update(next: string) {
    setValue(next);
    setSaving(true);
    await fetch(`/api/staff/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffType: next || null }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="w-44">
      <Select value={value} onChange={(e) => update(e.target.value)} disabled={saving}>
        <option value="">Support staff</option>
        <option value="PHARMACIST">Pharmacist</option>
      </Select>
    </div>
  );
}
