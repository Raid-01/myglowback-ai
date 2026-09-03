import { Input, Label } from '@/components/ui/input';
import { deriveSkinType, deriveSensitiveOverlay, deriveFitzpatrick, type FormState } from '@/lib/assessment-scoring';

export function ReviewStep({
  state,
  set,
}: {
  state: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  const derivedSkinType = deriveSkinType(state.tZone, state.cheeks, state.pores);
  const derivedSensitive = deriveSensitiveOverlay(state.reactivity ?? 0, state.diagnosedReactive, state.textureChangeType);
  const derivedFitzpatrick = deriveFitzpatrick(state.naturalTone ?? 0, state.sunReaction ?? 0);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-medium text-clinical-text">Anything else?</h2>
      <div>
        <Label htmlFor="goals">Anything else about the patient's skin or health we should know?</Label>
        <Input id="goals" value={state.goals} onChange={(e) => set('goals', e.target.value)} />
      </div>
      <div className="rounded-xl border border-clinical-border bg-ivory-100 p-4 text-sm text-clinical-text">
        <p className="mb-1 font-medium">Quick recap</p>
        <p>Skin type: {derivedSkinType || '—'}{derivedSensitive ? ' (reactive)' : ''}</p>
        <p>Fitzpatrick: {derivedFitzpatrick.replace('TYPE_', 'Type ')}</p>
        <p>Concerns: {state.concerns.join(', ') || '—'}</p>
      </div>
    </div>
  );
}
