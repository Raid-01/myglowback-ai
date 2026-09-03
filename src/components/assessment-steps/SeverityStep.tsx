import { ChoiceGroup, YesNo } from '@/components/ui/choice-group';
import type { FormState } from '@/lib/assessment-scoring';

export function SeverityStep({
  state,
  set,
}: {
  state: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div className="space-y-8">
      <h2 className="font-display text-lg font-medium text-clinical-text">A bit more detail</h2>

      {state.concerns.includes('ACNE') && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-sage-800">Acne</h3>
          <ChoiceGroup
            label="Right now, how many active breakouts do you typically have at once?"
            value={state.acneCount == null ? '' : String(state.acneCount)}
            onChange={(v) => set('acneCount', Number(v))}
            options={[
              { value: '0', label: '0–5' },
              { value: '1', label: '6–15' },
              { value: '2', label: '15+' },
            ]}
          />
          <ChoiceGroup
            label="Any deep, painful, cyst-like bumps under the skin?"
            value={state.acneCysts == null ? '' : String(state.acneCysts)}
            onChange={(v) => set('acneCysts', Number(v))}
            options={[
              { value: '0', label: 'None' },
              { value: '1', label: 'A few' },
              { value: '2', label: 'Several — this is my main concern' },
            ]}
          />
          <YesNo
            label="Has this continued for more than 3 months without improvement?"
            value={state.acneChronic}
            onChange={(v) => set('acneChronic', v)}
          />
          <YesNo
            label="Any scarring or dark marks left behind after breakouts heal?"
            value={state.acneScarring}
            onChange={(v) => set('acneScarring', v)}
          />
        </div>
      )}

      {state.concerns.includes('HYPERPIGMENTATION') && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-sage-800">Hyperpigmentation</h3>
          <ChoiceGroup
            label="How noticeable is the discoloration compared to your natural skin tone?"
            value={state.pigDarkness == null ? '' : String(state.pigDarkness)}
            onChange={(v) => set('pigDarkness', Number(v))}
            options={[
              { value: '0', label: 'Barely noticeable' },
              { value: '1', label: 'A shade or two darker' },
              { value: '2', label: 'Several shades darker / widespread' },
            ]}
          />
          <ChoiceGroup
            label="How long have you had it?"
            value={state.pigDuration == null ? '' : String(state.pigDuration)}
            onChange={(v) => set('pigDuration', Number(v))}
            options={[
              { value: '0', label: 'Under 3 months' },
              { value: '1', label: '3–12 months' },
              { value: '2', label: 'Over a year' },
            ]}
          />
          <YesNo
            label="Does it get darker with sun exposure or heat?"
            value={state.pigSunReactive}
            onChange={(v) => set('pigSunReactive', v)}
          />
          <ChoiceGroup
            label="Where is it located?"
            value={state.pigPattern}
            onChange={(v) => set('pigPattern', v)}
            options={[
              { value: 'mask', label: 'Mask-like pattern on cheeks/forehead' },
              { value: 'scars', label: 'Scattered spots from old breakouts' },
              { value: 'sun', label: 'Patches in sun-exposed areas' },
              { value: 'other', label: 'Other' },
            ]}
          />
        </div>
      )}

      {state.concerns.includes('SUN_DAMAGE') && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-sage-800">Sun damage</h3>
          <ChoiceGroup
            label="How often do you currently wear sunscreen?"
            value={state.sunSpfHabit == null ? '' : String(state.sunSpfHabit)}
            onChange={(v) => set('sunSpfHabit', Number(v))}
            options={[
              { value: '0', label: 'Daily, and I reapply outdoors' },
              { value: '1', label: 'Daily, rarely reapply' },
              { value: '2', label: 'Sometimes' },
              { value: '3', label: 'Never' },
            ]}
          />
          <ChoiceGroup
            label="How many of these do you currently notice? Rough texture, fine lines from sun, uneven tone, visible sunspots, broken capillaries"
            value={state.sunSignsCount == null ? '' : String(state.sunSignsCount)}
            onChange={(v) => set('sunSignsCount', Number(v))}
            options={[
              { value: '0', label: 'None' },
              { value: '1', label: '1–2 of these' },
              { value: '2', label: '3 or more' },
            ]}
          />
        </div>
      )}

      {state.concerns.includes('AGING') && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-sage-800">Aging</h3>
          <ChoiceGroup
            label="Which best describes your main concern?"
            value={state.agingMain == null ? '' : String(state.agingMain)}
            onChange={(v) => set('agingMain', Number(v))}
            options={[
              { value: '0', label: 'Fine lines only' },
              { value: '1', label: 'Deeper wrinkles' },
              { value: '2', label: 'Loss of firmness / sagging, or a combination' },
            ]}
          />
        </div>
      )}

      {state.concerns.includes('GLOWING_SKIN') && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-sage-800">Glowing skin</h3>
          <ChoiceGroup
            label="What's your main goal?"
            value={state.glowGoal}
            onChange={(v) => set('glowGoal', v)}
            options={[
              { value: 'tone', label: 'More even tone' },
              { value: 'hydration', label: 'More hydrated / plump skin' },
              { value: 'texture', label: 'Smoother texture' },
              { value: 'brightness', label: 'Overall brighter look' },
              { value: 'maintenance', label: 'General maintenance' },
            ]}
          />
          <ChoiceGroup
            label="How would you describe your current routine?"
            value={state.glowRoutine}
            onChange={(v) => set('glowRoutine', v)}
            options={[
              { value: 'none', label: 'None' },
              { value: 'cleanse', label: 'Cleanse only' },
              { value: 'cleanse-moisturize', label: 'Cleanse + moisturize' },
              { value: 'full', label: 'Full routine with actives' },
            ]}
          />
        </div>
      )}
    </div>
  );
}
