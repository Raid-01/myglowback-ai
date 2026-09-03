'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  STEP_IDS,
  STEP_LABELS,
  INITIAL_STATE,
  validateStep,
  buildSeverityByConcern,
  deriveSkinType,
  deriveSensitiveOverlay,
  deriveFitzpatrick,
  type FormState,
  type StepId,
} from '@/lib/assessment-scoring';
import { PatientStep } from '@/components/assessment-steps/PatientStep';
import { SafetyStep } from '@/components/assessment-steps/SafetyStep';
import { MedicalHistoryStep } from '@/components/assessment-steps/MedicalHistoryStep';
import { SkinTypeStep } from '@/components/assessment-steps/SkinTypeStep';
import { SunSensitivityStep } from '@/components/assessment-steps/SunSensitivityStep';
import { ConcernsStep } from '@/components/assessment-steps/ConcernsStep';
import { SeverityStep } from '@/components/assessment-steps/SeverityStep';
import { ReviewStep } from '@/components/assessment-steps/ReviewStep';

// ---------------------------------------------------------------------
// This form implements the full questionnaire in ASSESSMENT_QUESTIONNAIRE.md.
// It's deliberately just a shell now: state, navigation, and submission
// live here; every question lives in its own file under
// src/components/assessment-steps/, and all the scoring math lives in
// src/lib/assessment-scoring.ts. To change one question, open its one step
// file — nothing else in this file needs to be understood first.
// ---------------------------------------------------------------------

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

  const step = STEP_IDS[stepIndex];
  const totalSteps = STEP_IDS.length;

  function goNext() {
    const err = validateStep(step, s, isNewPatient);
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

  async function handleFinalSubmit() {
    const err = validateStep('concerns', s, isNewPatient);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);

    const payload: Record<string, unknown> = {
      skinType: deriveSkinType(s.tZone, s.cheeks, s.pores),
      sensitiveOverlay: deriveSensitiveOverlay(s.reactivity ?? 0, s.diagnosedReactive, s.textureChangeType),
      fitzpatrickType: deriveFitzpatrick(s.naturalTone ?? 0, s.sunReaction ?? 0),
      concerns: s.concerns,
      severityByConcern: buildSeverityByConcern(s),
      allergies: s.allergies || undefined,
      knownSkinConditions: s.knownSkinConditions || undefined,
      currentMedications: s.currentMedications || undefined,
      previousTreatments: s.previousTreatments || undefined,
      goals: s.goals || undefined,
      ageRange: s.ageRange || undefined,
      pregnancyStatus: s.pregnancyStatus || undefined,
      hormonalStage: s.hormonalStage || undefined,
      // Schema columns are non-nullable booleans — an unanswered (null) yes/no
      // question is stored as false, same as an explicit "No". The visual
      // bug this fixes was about never *showing* an unanswered question as
      // pre-clicked; once genuinely submitted, "never answered" and "no"
      // collapse to the same safe default, same as before this change.
      onHormonalContraceptionOrHRT: s.onHormonalContraceptionOrHRT ?? false,
      cycleRelatedFlares: s.cycleRelatedFlares ?? false,
      cyclePattern: s.cyclePattern,
      hotFlashesOrNightSweats: s.hotFlashesOrNightSweats ?? false,
      recentSkinTextureChange: s.recentSkinTextureChange ?? false,
      textureChangeType: s.textureChangeType,
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

  function renderStep(id: StepId) {
    switch (id) {
      case 'patient':
        return (
          <PatientStep
            state={s}
            set={set}
            patients={patients}
            isNewPatient={isNewPatient}
            setIsNewPatient={setIsNewPatient}
          />
        );
      case 'demographics':
        return <SafetyStep state={s} set={set} />;
      case 'medical-history':
        return <MedicalHistoryStep state={s} set={set} />;
      case 'skin-type':
        return <SkinTypeStep state={s} set={set} />;
      case 'sun-sensitivity':
        return <SunSensitivityStep state={s} set={set} />;
      case 'concerns':
        return <ConcernsStep state={s} toggleConcern={toggleConcern} />;
      case 'severity':
        return <SeverityStep state={s} set={set} />;
      case 'final':
        return <ReviewStep state={s} set={set} />;
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

      <Card>{renderStep(step)}</Card>

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
