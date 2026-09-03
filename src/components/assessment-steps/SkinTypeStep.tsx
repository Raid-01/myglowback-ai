import { ChoiceGroup, YesNo } from '@/components/ui/choice-group';
import { deriveSkinType, type FormState, type Tri } from '@/lib/assessment-scoring';

export function SkinTypeStep({
  state,
  set,
}: {
  state: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  const derivedSkinType = deriveSkinType(state.tZone, state.cheeks, state.pores);

  return (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-medium text-clinical-text">Skin type</h2>
      <p className="text-sm text-clinical-muted">
        A few hours after cleansing, with nothing else applied — how does your skin actually
        behave? We work out the type from this, not from a guess.
      </p>
      {/* 2.1 */}
      <ChoiceGroup
        label="Your T-zone (forehead, nose, chin)"
        value={state.tZone}
        onChange={(v) => set('tZone', v as Tri)}
        options={[
          { value: 'D', label: 'Tight or dry, sometimes flaky' },
          { value: 'N', label: 'Comfortable' },
          { value: 'O', label: 'Shiny or oily' },
        ]}
      />
      {/* 2.2 */}
      <ChoiceGroup
        label="Your cheeks"
        value={state.cheeks}
        onChange={(v) => set('cheeks', v as Tri)}
        options={[
          { value: 'D', label: 'Tight or dry, sometimes flaky' },
          { value: 'N', label: 'Comfortable' },
          { value: 'O', label: 'Shiny or oily' },
        ]}
      />
      {/* 2.3 */}
      <ChoiceGroup
        label="How visible are your pores?"
        value={state.pores}
        onChange={(v) => set('pores', v)}
        options={[
          { value: 'barely', label: 'Barely visible' },
          { value: 'tzone', label: 'Visible mainly in the T-zone' },
          { value: 'most', label: 'Visible and enlarged across most of the face' },
        ]}
      />
      {derivedSkinType && (
        <p className="rounded-xl bg-sage-50 px-4 py-2.5 text-sm text-sage-800">
          Based on those answers: <strong>{derivedSkinType.charAt(0) + derivedSkinType.slice(1).toLowerCase()}</strong> skin.
        </p>
      )}
      <hr className="border-clinical-border" />
      {/* 2.4 */}
      <ChoiceGroup
        label="Does your skin sting, burn, itch, or turn red after a new product, or in reaction to heat/cold/wind?"
        value={state.reactivity == null ? '' : String(state.reactivity)}
        onChange={(v) => set('reactivity', Number(v))}
        options={[
          { value: '0', label: 'Rarely or never' },
          { value: '1', label: 'Occasionally' },
          { value: '2', label: 'Frequently' },
        ]}
      />
      {/* 2.5 */}
      <YesNo
        label="Has a doctor diagnosed you with eczema, rosacea, or another reactive skin condition?"
        value={state.diagnosedReactive}
        onChange={(v) => set('diagnosedReactive', v)}
      />
    </div>
  );
}
