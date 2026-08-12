'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function LicenseVerificationEditor({
  clinicId,
  initialLicenseType,
  initialVerified,
  initialLicenseNumber,
}: {
  clinicId: string;
  initialLicenseType: 'PHARMACY' | 'AESTHETIC_OR_MERCHANT';
  initialVerified: boolean;
  initialLicenseNumber: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [licenseType, setLicenseType] = useState(initialLicenseType);
  const [licenseNumber, setLicenseNumber] = useState(initialLicenseNumber ?? '');
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState({ licenseType: initialLicenseType, verified: initialVerified });

  async function save(verified: boolean) {
    setSaving(true);
    const res = await fetch(`/api/super-admin/clinics/${clinicId}/license`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseType,
        professionalLicenseNumber: licenseNumber || null,
        verified,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setState({ licenseType: data.licenseType, verified: !!data.licenseVerifiedAt });
      setEditing(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <Badge tone={state.licenseType === 'PHARMACY' ? 'sage' : 'neutral'}>
          {state.licenseType === 'PHARMACY' ? 'Pharmacy' : 'Aesthetic/Merchant'}
        </Badge>
        {state.licenseType === 'PHARMACY' && (
          <Badge tone={state.verified ? 'sage' : 'danger'}>
            {state.verified ? 'Verified' : 'Unverified'}
          </Badge>
        )}
        <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-sage-700">
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        {(['AESTHETIC_OR_MERCHANT', 'PHARMACY'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setLicenseType(t)}
            className={cn(
              'rounded-lg border px-2 py-1 text-xs font-medium',
              licenseType === t ? 'border-sage-500 bg-sage-50 text-sage-800' : 'border-clinical-border bg-white'
            )}
          >
            {t === 'PHARMACY' ? 'Pharmacy' : 'Aesthetic/Merchant'}
          </button>
        ))}
      </div>
      {licenseType === 'PHARMACY' && (
        <Input
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          placeholder="PCN license number"
          className="h-8 w-40 text-xs"
        />
      )}
      <div className="flex items-center gap-2">
        {licenseType === 'PHARMACY' ? (
          <Button type="button" size="sm" onClick={() => save(true)} disabled={saving || !licenseNumber}>
            {saving ? 'Saving…' : 'Verify'}
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={() => save(false)} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        )}
        {state.verified && (
          <button type="button" onClick={() => save(false)} className="text-xs text-danger">
            Un-verify
          </button>
        )}
        <button type="button" onClick={() => setEditing(false)} className="text-xs text-clinical-muted">
          Cancel
        </button>
      </div>
    </div>
  );
}
