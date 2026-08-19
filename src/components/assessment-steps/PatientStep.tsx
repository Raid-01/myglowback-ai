import { Input, Label, Select } from '@/components/ui/input';
import { ChoiceGroup } from '@/components/ui/choice-group';
import type { FormState } from '@/lib/assessment-scoring';

export function PatientStep({
  state,
  set,
  patients,
  isNewPatient,
  setIsNewPatient,
}: {
  state: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  patients: { id: string; firstName: string; lastName: string }[];
  isNewPatient: boolean;
  setIsNewPatient: (v: boolean | ((prev: boolean) => boolean)) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-medium text-clinical-text">Patient</h2>
        {patients.length > 0 && (
          <button
            type="button"
            onClick={() => setIsNewPatient((v) => !v)}
            className="text-sm font-medium text-sage-700"
          >
            {isNewPatient ? 'Choose existing patient' : 'Add new patient'}
          </button>
        )}
      </div>

      {isNewPatient ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" value={state.firstName} onChange={(e) => set('firstName', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" value={state.lastName} onChange={(e) => set('lastName', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={state.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+234..." />
          </div>
          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" type="email" value={state.email} onChange={(e) => set('email', e.target.value)} />
          </div>
        </div>
      ) : (
        <div>
          <Label htmlFor="patientId">Patient</Label>
          <Select id="patientId" value={state.patientId} onChange={(e) => set('patientId', e.target.value)}>
            <option value="">Select a patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* 1.2 — sex at birth. Purely branching, asked here since it's demographic like the rest of this card. */}
      <div className="mt-4">
        <ChoiceGroup
          label="Sex assigned at birth"
          columns={4}
          value={state.biologicalSex}
          onChange={(v) => set('biologicalSex', v)}
          options={[
            { value: 'FEMALE', label: 'Female' },
            { value: 'MALE', label: 'Male' },
            { value: 'INTERSEX_OR_OTHER', label: 'Intersex / other' },
            { value: 'UNDISCLOSED', label: 'Prefer not to say' },
          ]}
        />
      </div>
    </div>
  );
}
