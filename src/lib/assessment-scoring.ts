// Pure logic for the assessment wizard — deliberately has zero UI in it, so
// it's independently testable and safe to change without touching any of
// the step components. Mirrors ASSESSMENT_QUESTIONNAIRE.md exactly; each
// function's comment references the question numbers it implements.

export type Tri = 'D' | 'N' | 'O' | '';

export const CONCERNS = [
  { value: 'ACNE', label: 'Acne' },
  { value: 'HYPERPIGMENTATION', label: 'Hyperpigmentation / dark spots' },
  { value: 'SUN_DAMAGE', label: 'Sun damage' },
  { value: 'AGING', label: 'Fine lines & aging' },
  { value: 'GLOWING_SKIN', label: 'General glow / even tone' },
] as const;

export const AGE_RANGES = [
  { value: 'UNDER_18', label: 'Under 18' },
  { value: 'AGE_18_25', label: '18–25' },
  { value: 'AGE_26_35', label: '26–35' },
  { value: 'AGE_36_45', label: '36–45' },
  { value: 'AGE_46_55', label: '46–55' },
  { value: 'AGE_55_PLUS', label: '55+' },
] as const;

export const STEP_IDS = [
  'patient',
  'demographics',
  'medical-history',
  'skin-type',
  'sun-sensitivity',
  'concerns',
  'severity',
  'final',
] as const;
export type StepId = (typeof STEP_IDS)[number];

export const STEP_LABELS: Record<StepId, string> = {
  patient: 'Patient',
  demographics: 'Safety check',
  'medical-history': 'Medical history',
  'skin-type': 'Skin type',
  'sun-sensitivity': 'Sun sensitivity',
  concerns: 'Concerns',
  severity: 'Severity',
  final: 'Review',
};

// Part 2 — objective skin type (not a self-label)
export function deriveSkinType(tZone: Tri, cheeks: Tri, pores: string): string {
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

// Part 2.4/2.5 — sensitivity overlay, independent of base skin type.
// A recent-onset "more sensitive" answer from the Part 1 texture-change
// follow-up counts toward this same flag (worth +2, same weight as a
// doctor-diagnosed reactive condition) — a newly-reactive patient should
// get the gentler tier regardless of which question caught it first.
export function deriveSensitiveOverlay(
  reactivity: number,
  diagnosed: boolean | null,
  textureChangeType: string[] = []
): boolean {
  const recentlyMoreSensitive = textureChangeType.includes('more_sensitive');
  return reactivity + (diagnosed ? 2 : 0) + (recentlyMoreSensitive ? 2 : 0) >= 2;
}

// Part 3 — Fitzpatrick self-assessment
export function deriveFitzpatrick(naturalTone: number, sunReaction: number): string {
  const sum = naturalTone + sunReaction;
  if (sum <= 1) return 'TYPE_I';
  if (sum <= 3) return 'TYPE_II';
  if (sum <= 5) return 'TYPE_III';
  if (sum <= 7) return 'TYPE_IV';
  if (sum <= 9) return 'TYPE_V';
  return 'TYPE_VI';
}

export function bandSeverity(score: number, mildMax: number, modMax: number): 'MILD' | 'MODERATE' | 'SEVERE' {
  if (score <= mildMax) return 'MILD';
  if (score <= modMax) return 'MODERATE';
  return 'SEVERE';
}

export interface FormState {
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
  onHormonalContraceptionOrHRT: boolean | null; // 1.5 — null = not yet answered, never defaults to "No"
  cycleRelatedFlares: boolean | null; // 1.6a
  cyclePattern: string[]; // follow-up if cycleRelatedFlares === true: how it changes
  hotFlashesOrNightSweats: boolean | null; // 1.6b
  recentSkinTextureChange: boolean | null; // hormonal-shift signal, see Section 7B of the source protocol
  textureChangeType: string[]; // follow-up if recentSkinTextureChange === true: what changed

  // medical history (Part 1 cont.)
  allergies: string; // 1.7
  knownSkinConditions: string; // 1.8
  currentMedications: string; // 1.9
  previousTreatments: string; // 1.10

  // skin type (Part 2)
  tZone: Tri; // 2.1
  cheeks: Tri; // 2.2
  pores: string; // 2.3
  reactivity: number | null; // 2.4 (0/1/2)
  diagnosedReactive: boolean | null; // 2.5

  // Fitzpatrick (Part 3)
  naturalTone: number | null; // 3.1 (0-5)
  sunReaction: number | null; // 3.2 (0-5)

  // concerns (Part 4)
  concerns: string[];

  // severity (Parts 5A-5E) — only the relevant sub-object matters per selected concern
  acneCount: number | null; // 5A.1
  acneCysts: number | null; // 5A.2
  acneChronic: boolean | null; // 5A.3
  acneScarring: boolean | null; // 5A.4

  pigDarkness: number | null; // 5B.1
  pigDuration: number | null; // 5B.2
  pigSunReactive: boolean | null; // 5B.3
  pigPattern: string; // 5B.4

  sunSpfHabit: number | null; // 5C.1
  sunSignsCount: number | null; // 5C.2

  agingMain: number | null; // 5D.1

  glowGoal: string; // 5E.1
  glowRoutine: string; // 5E.2

  // final (Part 6)
  goals: string;
}

export const INITIAL_STATE: FormState = {
  patientId: '', firstName: '', lastName: '', phone: '', email: '', biologicalSex: '',
  ageRange: '', pregnancyStatus: '', hormonalStage: '', onHormonalContraceptionOrHRT: null,
  cycleRelatedFlares: null, cyclePattern: [], hotFlashesOrNightSweats: null,
  recentSkinTextureChange: null, textureChangeType: [],
  allergies: '', knownSkinConditions: '', currentMedications: '', previousTreatments: '',
  tZone: '', cheeks: '', pores: '', reactivity: null, diagnosedReactive: null,
  naturalTone: null, sunReaction: null,
  concerns: [],
  acneCount: null, acneCysts: null, acneChronic: null, acneScarring: null,
  pigDarkness: null, pigDuration: null, pigSunReactive: null, pigPattern: '',
  sunSpfHabit: null, sunSignsCount: null,
  agingMain: null,
  glowGoal: '', glowRoutine: '',
  goals: '',
};

export function validateStep(id: StepId, s: FormState, isNewPatient: boolean): string | null {
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

/** Every field the submit payload needs, derived from raw answers — the
 * severity-scoring rules from ASSESSMENT_QUESTIONNAIRE.md Parts 5A–5D live
 * here, not scattered across the submit handler. */
export function buildSeverityByConcern(s: FormState): Record<string, string> {
  const severityByConcern: Record<string, string> = {};
  if (s.concerns.includes('ACNE')) {
    severityByConcern.ACNE = bandSeverity((s.acneCount ?? 0) + (s.acneCysts ?? 0) + (s.acneChronic ? 1 : 0), 1, 3);
  }
  if (s.concerns.includes('HYPERPIGMENTATION')) {
    severityByConcern.HYPERPIGMENTATION = bandSeverity((s.pigDarkness ?? 0) + (s.pigDuration ?? 0), 1, 2);
  }
  if (s.concerns.includes('SUN_DAMAGE')) {
    severityByConcern.SUN_DAMAGE = bandSeverity((s.sunSpfHabit ?? 0) + (s.sunSignsCount ?? 0), 1, 3);
  }
  if (s.concerns.includes('AGING')) {
    severityByConcern.AGING = bandSeverity(s.agingMain ?? 0, 0, 1);
  }
  // GLOWING_SKIN intentionally has no severity tier — see ASSESSMENT_QUESTIONNAIRE.md Part 5E
  return severityByConcern;
}
