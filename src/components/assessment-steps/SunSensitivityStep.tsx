import { ChoiceGroup } from '@/components/ui/choice-group';
import { deriveFitzpatrick, type FormState } from '@/lib/assessment-scoring';

export function SunSensitivityStep({
  state,
  set,
}: {
  state: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  const bothAnswered = state.naturalTone != null && state.sunReaction != null;
  const derivedFitzpatrick = bothAnswered ? deriveFitzpatrick(state.naturalTone ?? 0, state.sunReaction ?? 0) : null;

  return (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-medium text-clinical-text">Sun sensitivity</h2>
      {/* 3.1 */}
      <ChoiceGroup
        label="Your natural skin color on an area rarely exposed to sun (inner upper arm)"
        value={state.naturalTone == null ? '' : String(state.naturalTone)}
        onChange={(v) => set('naturalTone', Number(v))}
        options={[
          { value: '0', label: 'Very pale / ivory' },
          { value: '1', label: 'Fair / light beige' },
          { value: '2', label: 'Light-medium / olive-beige' },
          { value: '3', label: 'Medium / tan-brown' },
          { value: '4', label: 'Deep brown' },
          { value: '5', label: 'Deeply pigmented, dark brown to black' },
        ]}
      />
      {/* 3.2 */}
      <ChoiceGroup
        label="After ~30-45 minutes of your first strong, unprotected sun exposure of the season, what usually happens?"
        value={state.sunReaction == null ? '' : String(state.sunReaction)}
        onChange={(v) => set('sunReaction', Number(v))}
        options={[
          { value: '0', label: 'Always burns badly, never tans' },
          { value: '1', label: 'Burns easily, tans minimally' },
          { value: '2', label: 'Burns mildly, gradually tans light brown' },
          { value: '3', label: 'Rarely burns, tans well to moderate brown' },
          { value: '4', label: 'Very rarely burns, tans deeply' },
          { value: '5', label: 'Never burns, always deeply pigments' },
        ]}
      />
      {derivedFitzpatrick && (
        <p className="rounded-xl bg-sage-50 px-4 py-2.5 text-sm text-sage-800">
          Fitzpatrick {derivedFitzpatrick.replace('TYPE_', 'Type ')}
        </p>
      )}
    </div>
  );
}
