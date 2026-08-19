import { Input, Label } from '@/components/ui/input';
import type { FormState } from '@/lib/assessment-scoring';

export function MedicalHistoryStep({
  state,
  set,
}: {
  state: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-medium text-clinical-text">Medical history</h2>
      <div>
        <Label htmlFor="allergies">Known allergies or ingredient reactions</Label>
        <Input id="allergies" value={state.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="e.g. fragrance, retinol" />
      </div>
      <div>
        <Label htmlFor="knownSkinConditions">Doctor-diagnosed skin conditions (eczema, rosacea, etc.)</Label>
        <Input id="knownSkinConditions" value={state.knownSkinConditions} onChange={(e) => set('knownSkinConditions', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="currentMedications">Current prescription skincare or oral medications</Label>
        <Input id="currentMedications" value={state.currentMedications} onChange={(e) => set('currentMedications', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="previousTreatments">Previous treatments tried, and did they help?</Label>
        <Input id="previousTreatments" value={state.previousTreatments} onChange={(e) => set('previousTreatments', e.target.value)} />
      </div>
    </div>
  );
}
