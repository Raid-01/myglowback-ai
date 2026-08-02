'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------
// This form implements the full questionnaire in ASSESSMENT_QUESTIONNAIRE.md.
// Each numbered comment below (1.1, 2.3, 5A.2, etc.) matches that document's
// question numbering directly, so the two stay easy to cross-check.
// ---------------------------------------------------------------------

const CONCERNS = [
  { value: 'ACNE', label: 'Acne' },
  { value: 'HYPERPIGMENTATION', label: 'Hyperpigmentation / dark spots' },
  { value: 'SUN_DAMAGE', label: 'Sun damage' },
  { value: 'AGING', label: 'Fine lines & aging' },
  { value: 'GLOWING_SKIN', label: 'General glow / even tone' },
] as const;

const AGE_RANGES = [
  { value: 'UNDER_18', label: 'Under 18' },
  { value: 'AGE_18_25', label: '18–25' },
  { value: 'AGE_26_35', label: '26–35' },
  { value: 'AGE_36_45', label: '36–45' },
  { value: 'AGE_46_55', label: '46–55' },
  { value: 'AGE_55_PLUS', label: '55+' },
] as const;

const STEP_IDS = [
  'patient',
  'demographics',
  'medical-history',
  'skin-type',
  'sun-sensitivity',
  'concerns',
  'severity',
  'final',
] as const;
type StepId = (typeof STEP_IDS)[number];

const STEP_LABELS: Record<StepId, string> = {
  patient: 'Patient',
  demographics: 'Safety check',
  'medical-history': 'Medical history',
  'skin-type': 'Skin type',
  'sun-sensitivity': 'Sun sensitivity',
  concerns: 'Concerns',
  severity: 'Severity',
  final: 'Review',
};

// --- Reusable single-select choice buttons (matches the existing concern-toggle style) ---
const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
  columns = 1,
  hint,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
  hint?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {hint && <p className="mb-2 -mt-1 text-xs text-clinical-muted">{hint}</p>}
      <div className={cn('grid gap-2', GRID_COLS[columns] ?? GRID_COLS[1])}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors',
              value === o.value
                ? 'border-sage-500 bg-sage-50 text-sage-800'
                : 'border-clinical-border bg-white text-clinical-text hover:bg-ivory-100'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <ChoiceGroup
      label={label}
      columns={2}
      value={value ? 'yes' : 'no'}
      onChange={(v) => onChange(v === 'yes')}
      options={[
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ]}
    />
  );
}

// --- Derivation functions — mirror ASSESSMENT_QUESTIONNAIRE.md exactly ---

type Tri = 'D' | 'N' | 'O' | '';

// Part 2 — objective skin type (not a self-label)
function deriveSkinType(tZone: Tri, cheeks: Tri, pores: string): string {
  if (!tZone || !cheeks) return '';
  const table: Record<string, string> = {
    'D-D': 'DRY', 'D-N': 'DRY', 'D-O': 'COMBINATION',
    'N-D': 'DRY', 'N-N': 'NORMAL', 'N-O': 'COMBINATION',
    'O-D': 'COMBINATION', 'O-N': 'COMBINATION', 'O-O': 'OILY',
  };
  let result = table[`${tZone}-${cheeks}`] ?? 'NORMAL';
  if (pores === 'most' && result !== 'OILY') result = 'OILY';
  if (pores === 'barely' && result === 'COMBINATION') result = tZone === 'O' ? 'COMBINATION' : 'DRY';
  return result;
}

// Part 2.4/2.5 — sensitivity overlay, independent of base skin type
function deriveSensitiveOverlay(reactivity: number, diagnosed: boolean): boolean {
  return reactivity + (diagnosed ? 2 : 0) >= 2;
}

// Part 3 — Fitzpatrick self-assessment
function deriveFitzpatrick(naturalTone: number, sunReaction: number): string {
  const sum = naturalTone + sunReaction;
  if (sum <= 1) return 'TYPE_I';
  if (sum <= 3) return 'TYPE_II';
  if (sum <= 5) return 'TYPE_III';
  if (sum <= 7) return 'TYPE_IV';
  if (sum <= 9) return 'TYPE_V';
  return 'TYPE_VI';
}

function bandSeverity(score: number, mildMax: number, modMax: number): 'MILD' | 'MODERATE' | 'SEVERE' {
  if (score <= mildMax) return 'MILD';
  if (score <= modMax) return 'MODERATE';
  return 'SEVERE';
}

interface FormState {
  // patient
  patientId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  biologicalSex: string; // 1.2

  // demographics / safety (Part 1)
  ageRange: string; // 1.1
  pregnancyStatus: string; // 1.3
  hormonalStage: string; // 1.4
  onHormonalContraceptionOrHRT: boolean; // 1.5
  cycleRelatedFlares: boolean; // 1.6a
  hotFlashesOrNightSweats: boolean; // 1.6b
  recentSkinTextureChange: boolean; // hormonal-shift signal, see Section 7B of the source protocol

  // medical history (Part 1 cont.)
  allergies: string; // 1.7
  knownSkinConditions: string; // 1.8
  currentMedications: string; // 1.9
  previousTreatments: string; // 1.10

  // skin type (Part 2)
  tZone: Tri; // 2.1
  cheeks: Tri; // 2.2
  pores: string; // 2.3
  reactivity: number; // 2.4 (0/1/2)
  diagnosedReactive: boolean; // 2.5

  // Fitzpatrick (Part 3)
  naturalTone: number; // 3.1 (0-5)
  sunReaction: number; // 3.2 (0-5)

  // concerns (Part 4)
  concerns: string[];

  // severity (Parts 5A-5E) — only the relevant sub-object matters per selected concern
  acneCount: number; // 5A.1
  acneCysts: number; // 5A.2
  acneChronic: boolean; // 5A.3
  acneScarring: boolean; // 5A.4

  pigDarkness: number; // 5B.1
  pigDuration: number; // 5B.2
  pigSunReactive: boolean; // 5B.3
  pigPattern: string; // 5B.4

  sunSpfHabit: number; // 5C.1
  sunSignsCount: number; // 5C.2

  agingMain: number; // 5D.1

  glowGoal: string; // 5E.1
  glowRoutine: string; // 5E.2

  // final (Part 6)
  goals: string;
}

const INITIAL_STATE: FormState = {
  patientId: '', firstName: '', lastName: '', phone: '', email: '', biologicalSex: '',
  ageRange: '', pregnancyStatus: '', hormonalStage: '', onHormonalContraceptionOrHRT: false,
  cycleRelatedFlares: false, hotFlashesOrNightSweats: false, recentSkinTextureChange: false,
  allergies: '', knownSkinConditions: '', currentMedications: '', previousTreatments: '',
  tZone: '', cheeks: '', pores: '', reactivity: 0, diagnosedReactive: false,
  naturalTone: 0, sunReaction: 0,
  concerns: [],
  acneCount: 0, acneCysts: 0, acneChronic: false, acneScarring: false,
  pigDarkness: 0, pigDuration: 0, pigSunReactive: false, pigPattern: '',
  sunSpfHabit: 0, sunSignsCount: 0,
  agingMain: 0,
  glowGoal: '', glowRoutine: '',
  goals: '',
};

export function AssessmentForm({ patients }: { patients: { id: string; firstName: string; lastName: string }[] }) {
  const router = useRouter();
  const [isNewPatient, setIsNewPatient] = useState(patients.length === 0);
  const [stepIndex, setStepIndex] = useState(0);
  const [s, setS] = useState<FormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
  }

  function toggleConcern(value: string) {
    setS((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(value)
        ? prev.concerns.filter((c) => c !== value)
        : [...prev.concerns, value],
    }));
  }

  // 1.3/1.4 only apply if sex is Female or undisclosed — never assumed, never shown to a
  // patient who selected Male.
  const showsPregnancyQuestions = s.biologicalSex === 'FEMALE' || s.biologicalSex === 'UNDISCLOSED';
  const alreadyPregnantOrBreastfeeding = s.pregnancyStatus === 'PREGNANT' || s.pregnancyStatus === 'BREASTFEEDING';

  const step = STEP_IDS[stepIndex];
  const totalSteps = STEP_IDS.length;

  function validateStep(id: StepId): string | null {
    if (id === 'patient') {
      if (isNewPatient) {
        if (!s.firstName || !s.lastName || !s.phone) return 'First name, last name, and phone are required.';
      } else if (!s.patientId) {
        return 'Select a patient.';
      }
    }
    if (id === 'skin-type' && (!s.tZone || !s.cheeks || !s.pores)) {
      return 'Answer all three questions so we can work out the skin type properly.';
    }
    if (id === 'concerns' && s.concerns.length === 0) {
      return 'Select at least one concern.';
    }
    return null;
  }

  function goNext() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  }

  function goBack() {
    setError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  const derivedSkinType = useMemo(() => deriveSkinType(s.tZone, s.cheeks, s.pores), [s.tZone, s.cheeks, s.pores]);
  const derivedSensitive = useMemo(
    () => deriveSensitiveOverlay(s.reactivity, s.diagnosedReactive),
    [s.reactivity, s.diagnosedReactive]
  );
  const derivedFitzpatrick = useMemo(
    () => deriveFitzpatrick(s.naturalTone, s.sunReaction),
    [s.naturalTone, s.sunReaction]
  );

  async function handleFinalSubmit() {
    const err = validateStep('concerns');
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);

    const severityByConcern: Record<string, string> = {};
    if (s.concerns.includes('ACNE')) {
      severityByConcern.ACNE = bandSeverity(s.acneCount + s.acneCysts + (s.acneChronic ? 1 : 0), 1, 3);
    }
    if (s.concerns.includes('HYPERPIGMENTATION')) {
      severityByConcern.HYPERPIGMENTATION = bandSeverity(s.pigDarkness + s.pigDuration, 1, 2);
    }
    if (s.concerns.includes('SUN_DAMAGE')) {
      severityByConcern.SUN_DAMAGE = bandSeverity(s.sunSpfHabit + s.sunSignsCount, 1, 3);
    }
    if (s.concerns.includes('AGING')) {
      severityByConcern.AGING = bandSeverity(s.agingMain, 0, 1);
    }
    // GLOWING_SKIN intentionally has no severity tier — see ASSESSMENT_QUESTIONNAIRE.md Part 5E

    const payload: Record<string, unknown> = {
      skinType: derivedSkinType,
      sensitiveOverlay: derivedSensitive,
      fitzpatrickType: derivedFitzpatrick,
      concerns: s.concerns,
      severityByConcern,
      allergies: s.allergies || undefined,
      knownSkinConditions: s.knownSkinConditions || undefined,
      currentMedications: s.currentMedications || undefined,
      previousTreatments: s.previousTreatments || undefined,
      goals: s.goals || undefined,
      ageRange: s.ageRange || undefined,
      pregnancyStatus: s.pregnancyStatus || undefined,
      hormonalStage: s.hormonalStage || undefined,
      onHormonalContraceptionOrHRT: s.onHormonalContraceptionOrHRT,
      cycleRelatedFlares: s.cycleRelatedFlares,
      hotFlashesOrNightSweats: s.hotFlashesOrNightSweats,
      recentSkinTextureChange: s.recentSkinTextureChange,
    };

    if (isNewPatient) {
      payload.firstName = s.firstName;
      payload.lastName = s.lastName;
      payload.phone = s.phone;
      payload.email = s.email || undefined;
      payload.biologicalSex = s.biologicalSex || undefined;
    } else {
      payload.patientId = s.patientId;
    }

    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setLoading(false);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error?.formErrors?.[0] ?? body?.error ?? 'Something went wrong.');
        return;
      }
      const { id } = await res.json();
      router.push(`/dashboard/assessments/${id}`);
    } catch {
      setLoading(false);
      setError('Could not reach the server. Check your connection and try again.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEP_IDS.map((id, i) => (
          <div
            key={id}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i <= stepIndex ? 'bg-sage-500' : 'bg-clinical-border'
            )}
          />
        ))}
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-clinical-muted">
        Step {stepIndex + 1} of {totalSteps} · {STEP_LABELS[step]}
      </p>

      <Card>
        {step === 'patient' && (
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
                  <Input id="firstName" value={s.firstName} onChange={(e) => set('firstName', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={s.lastName} onChange={(e) => set('lastName', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={s.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+234..." />
                </div>
                <div>
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input id="email" type="email" value={s.email} onChange={(e) => set('email', e.target.value)} />
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="patientId">Patient</Label>
                <Select id="patientId" value={s.patientId} onChange={(e) => set('patientId', e.target.value)}>
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
                value={s.biologicalSex}
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
        )}

        {step === 'demographics' && (
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
              value={s.ageRange}
              onChange={(v) => set('ageRange', v)}
              options={AGE_RANGES.map((a) => ({ value: a.value, label: a.label }))}
            />

            {showsPregnancyQuestions && (
              <>
                {/* 1.3 */}
                <ChoiceGroup
                  label="Are you currently pregnant, breastfeeding, or trying to conceive?"
                  value={s.pregnancyStatus}
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
                      value={s.hormonalStage}
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
                      value={s.onHormonalContraceptionOrHRT}
                      onChange={(v) => set('onHormonalContraceptionOrHRT', v)}
                    />
                    {/* 1.6 */}
                    <YesNo
                      label="Does your skin change noticeably around your menstrual cycle?"
                      value={s.cycleRelatedFlares}
                      onChange={(v) => set('cycleRelatedFlares', v)}
                    />
                    <YesNo
                      label="Do you get hot flashes or night sweats?"
                      value={s.hotFlashesOrNightSweats}
                      onChange={(v) => set('hotFlashesOrNightSweats', v)}
                    />
                    <YesNo
                      label="Noticed any recent change in your skin's texture (drier, more sensitive)?"
                      value={s.recentSkinTextureChange}
                      onChange={(v) => set('recentSkinTextureChange', v)}
                    />
                  </>
                )}
              </>
            )}
          </div>
        )}

        {step === 'medical-history' && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-medium text-clinical-text">Medical history</h2>
            <div>
              <Label htmlFor="allergies">Known allergies or ingredient reactions</Label>
              <Input id="allergies" value={s.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="e.g. fragrance, retinol" />
            </div>
            <div>
              <Label htmlFor="knownSkinConditions">Doctor-diagnosed skin conditions (eczema, rosacea, etc.)</Label>
              <Input id="knownSkinConditions" value={s.knownSkinConditions} onChange={(e) => set('knownSkinConditions', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="currentMedications">Current prescription skincare or oral medications</Label>
              <Input id="currentMedications" value={s.currentMedications} onChange={(e) => set('currentMedications', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="previousTreatments">Previous treatments tried, and did they help?</Label>
              <Input id="previousTreatments" value={s.previousTreatments} onChange={(e) => set('previousTreatments', e.target.value)} />
            </div>
          </div>
        )}

        {step === 'skin-type' && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-medium text-clinical-text">Skin type</h2>
            <p className="text-sm text-clinical-muted">
              A few hours after cleansing, with nothing else applied — how does your skin actually
              behave? We work out the type from this, not from a guess.
            </p>
            {/* 2.1 */}
            <ChoiceGroup
              label="Your T-zone (forehead, nose, chin)"
              value={s.tZone}
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
              value={s.cheeks}
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
              value={s.pores}
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
              value={String(s.reactivity)}
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
              value={s.diagnosedReactive}
              onChange={(v) => set('diagnosedReactive', v)}
            />
          </div>
        )}

        {step === 'sun-sensitivity' && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-medium text-clinical-text">Sun sensitivity</h2>
            {/* 3.1 */}
            <ChoiceGroup
              label="Your natural skin color on an area rarely exposed to sun (inner upper arm)"
              value={String(s.naturalTone)}
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
              value={String(s.sunReaction)}
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
            <p className="rounded-xl bg-sage-50 px-4 py-2.5 text-sm text-sage-800">
              Fitzpatrick {derivedFitzpatrick.replace('TYPE_', 'Type ')}
            </p>
          </div>
        )}

        {step === 'concerns' && (
          <div>
            <h2 className="mb-4 font-display text-lg font-medium text-clinical-text">What would you like help with?</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CONCERNS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggleConcern(c.value)}
                  className={cn(
                    'rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                    s.concerns.includes(c.value)
                      ? 'border-sage-500 bg-sage-50 text-sage-800'
                      : 'border-clinical-border bg-white text-clinical-text'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-clinical-muted">Select all that apply.</p>
          </div>
        )}

        {step === 'severity' && (
          <div className="space-y-8">
            <h2 className="font-display text-lg font-medium text-clinical-text">A bit more detail</h2>

            {s.concerns.includes('ACNE') && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-sage-800">Acne</h3>
                <ChoiceGroup
                  label="Right now, how many active breakouts do you typically have at once?"
                  value={String(s.acneCount)}
                  onChange={(v) => set('acneCount', Number(v))}
                  options={[
                    { value: '0', label: '0–5' },
                    { value: '1', label: '6–15' },
                    { value: '2', label: '15+' },
                  ]}
                />
                <ChoiceGroup
                  label="Any deep, painful, cyst-like bumps under the skin?"
                  value={String(s.acneCysts)}
                  onChange={(v) => set('acneCysts', Number(v))}
                  options={[
                    { value: '0', label: 'None' },
                    { value: '1', label: 'A few' },
                    { value: '2', label: 'Several — this is my main concern' },
                  ]}
                />
                <YesNo
                  label="Has this continued for more than 3 months without improvement?"
                  value={s.acneChronic}
                  onChange={(v) => set('acneChronic', v)}
                />
                <YesNo
                  label="Any scarring or dark marks left behind after breakouts heal?"
                  value={s.acneScarring}
                  onChange={(v) => set('acneScarring', v)}
                />
              </div>
            )}

            {s.concerns.includes('HYPERPIGMENTATION') && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-sage-800">Hyperpigmentation</h3>
                <ChoiceGroup
                  label="How noticeable is the discoloration compared to your natural skin tone?"
                  value={String(s.pigDarkness)}
                  onChange={(v) => set('pigDarkness', Number(v))}
                  options={[
                    { value: '0', label: 'Barely noticeable' },
                    { value: '1', label: 'A shade or two darker' },
                    { value: '2', label: 'Several shades darker / widespread' },
                  ]}
                />
                <ChoiceGroup
                  label="How long have you had it?"
                  value={String(s.pigDuration)}
                  onChange={(v) => set('pigDuration', Number(v))}
                  options={[
                    { value: '0', label: 'Under 3 months' },
                    { value: '1', label: '3–12 months' },
                    { value: '2', label: 'Over a year' },
                  ]}
                />
                <YesNo
                  label="Does it get darker with sun exposure or heat?"
                  value={s.pigSunReactive}
                  onChange={(v) => set('pigSunReactive', v)}
                />
                <ChoiceGroup
                  label="Where is it located?"
                  value={s.pigPattern}
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

            {s.concerns.includes('SUN_DAMAGE') && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-sage-800">Sun damage</h3>
                <ChoiceGroup
                  label="How often do you currently wear sunscreen?"
                  value={String(s.sunSpfHabit)}
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
                  value={String(s.sunSignsCount)}
                  onChange={(v) => set('sunSignsCount', Number(v))}
                  options={[
                    { value: '0', label: 'None' },
                    { value: '1', label: '1–2 of these' },
                    { value: '2', label: '3 or more' },
                  ]}
                />
              </div>
            )}

            {s.concerns.includes('AGING') && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-sage-800">Aging</h3>
                <ChoiceGroup
                  label="Which best describes your main concern?"
                  value={String(s.agingMain)}
                  onChange={(v) => set('agingMain', Number(v))}
                  options={[
                    { value: '0', label: 'Fine lines only' },
                    { value: '1', label: 'Deeper wrinkles' },
                    { value: '2', label: 'Loss of firmness / sagging, or a combination' },
                  ]}
                />
              </div>
            )}

            {s.concerns.includes('GLOWING_SKIN') && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-sage-800">Glowing skin</h3>
                <ChoiceGroup
                  label="What's your main goal?"
                  value={s.glowGoal}
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
                  value={s.glowRoutine}
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
        )}

        {step === 'final' && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-medium text-clinical-text">Anything else?</h2>
            <div>
              <Label htmlFor="goals">Anything else about the patient's skin or health we should know?</Label>
              <Input id="goals" value={s.goals} onChange={(e) => set('goals', e.target.value)} />
            </div>
            <div className="rounded-xl border border-clinical-border bg-ivory-100 p-4 text-sm text-clinical-text">
              <p className="mb-1 font-medium">Quick recap</p>
              <p>Skin type: {derivedSkinType || '—'}{derivedSensitive ? ' (reactive)' : ''}</p>
              <p>Fitzpatrick: {derivedFitzpatrick.replace('TYPE_', 'Type ')}</p>
              <p>Concerns: {s.concerns.join(', ') || '—'}</p>
            </div>
          </div>
        )}
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center justify-between">
        <Button type="button" variant="secondary" onClick={goBack} disabled={stepIndex === 0}>
          Back
        </Button>
        {step === 'final' ? (
          <Button type="button" size="lg" onClick={handleFinalSubmit} disabled={loading}>
            {loading ? 'Matching…' : 'Generate Routine'}
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={goNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
