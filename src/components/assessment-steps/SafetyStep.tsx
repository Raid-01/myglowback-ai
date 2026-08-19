import { ChoiceGroup, YesNo } from '@/components/ui/choice-group';
import { AGE_RANGES, type FormState } from '@/lib/assessment-scoring';

export function SafetyStep({
  state,
  set,
}: {
  state: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  // 1.3/1.4 only apply if sex is Female or undisclosed — never assumed, never shown to a
  // patient who selected Male.
  const showsPregnancyQuestions = state.biologicalSex === 'FEMALE' || state.biologicalSex === 'UNDISCLOSED';
  const alreadyPregnantOrBreastfeeding =
    state.pregnancyStatus === 'PREGNANT' || state.pregnancyStatus === 'BREASTFEEDING';

  return (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-medium text-clinical-text">Safety check</h2>
      <p className="text-sm text-clinical-muted">
        These answers directly control which ingredients can ever be recommended — a few
        actives are unsafe in pregnancy, and we never guess.
      </p>

      {/* 1.1 */}
      <ChoiceGroup
        label="Age range"
        columns={4}
        value={state.ageRange}
        onChange={(v) => set('ageRange', v)}
        options={AGE_RANGES.map((a) => ({ value: a.value, label: a.label }))}
      />

      {showsPregnancyQuestions && (
        <>
          {/* 1.3 */}
          <ChoiceGroup
            label="Are you currently pregnant, breastfeeding, or trying to conceive?"
            value={state.pregnancyStatus}
            onChange={(v) => set('pregnancyStatus', v)}
            options={[
              { value: 'PREGNANT', label: 'Pregnant' },
              { value: 'BREASTFEEDING', label: 'Breastfeeding' },
              { value: 'TRYING_TO_CONCEIVE', label: 'Trying to conceive' },
              { value: 'NONE', label: 'None of these' },
            ]}
          />

          {!alreadyPregnantOrBreastfeeding && (
            <>
              {/* 1.4 */}
              <ChoiceGroup
                label="Have you gone through menopause?"
                value={state.hormonalStage}
                onChange={(v) => set('hormonalStage', v)}
                options={[
                  { value: 'REPRODUCTIVE', label: 'Not yet' },
                  { value: 'PERIMENOPAUSAL', label: 'Perimenopausal (periods becoming irregular)' },
                  { value: 'MENOPAUSAL', label: 'Yes, menopausal' },
                  { value: 'NOT_APPLICABLE', label: 'Not applicable' },
                ]}
              />
              {/* 1.5 */}
              <YesNo
                label="Currently on hormonal birth control or HRT?"
                value={state.onHormonalContraceptionOrHRT}
                onChange={(v) => set('onHormonalContraceptionOrHRT', v)}
              />
              {/* 1.6 */}
              <YesNo
                label="Does your skin change noticeably around your menstrual cycle?"
                value={state.cycleRelatedFlares}
                onChange={(v) => set('cycleRelatedFlares', v)}
              />
              <YesNo
                label="Do you get hot flashes or night sweats?"
                value={state.hotFlashesOrNightSweats}
                onChange={(v) => set('hotFlashesOrNightSweats', v)}
              />
              <YesNo
                label="Noticed any recent change in your skin's texture (drier, more sensitive)?"
                value={state.recentSkinTextureChange}
                onChange={(v) => set('recentSkinTextureChange', v)}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
