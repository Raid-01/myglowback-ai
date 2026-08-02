import { prisma } from './prisma';
import type { Concern, SkinType, Product, PregnancyStatus, AgeRange } from '@prisma/client';
import { addDays } from 'date-fns';

interface RuleCondition {
  concerns?: string[];
  skinType?: string[];
  avoidIngredients?: string[];
  severity?: string[]; // optional — e.g. ["MODERATE", "SEVERE"]. Rules with no
  // severity listed are treated as applicable at any severity (safe fallback).
}

interface RuleRoutine {
  am: string[];
  pm: string[];
}

export interface AssessmentInput {
  clinicId: string;
  skinType: SkinType;
  concerns: Concern[];
  allergies?: string | null;
  ageRange?: AgeRange | null;
  pregnancyStatus?: PregnancyStatus; // defaults to NOT_APPLICABLE if omitted
  severityByConcern?: Partial<Record<string, string>>; // Concern -> SeverityLevel
}

export interface MatchResult {
  routine: { am: string[]; pm: string[] };
  ingredients: string[];
  matchedProducts: Product[];
  upsells: string[];
  followUpDate: Date;
  matchedRuleNames: string[];
  safetyBlockedIngredients: string[]; // transparency record for the dispensing pharmacist
  escalationNote: string | null;
}

// --- Hard-safety ingredient blocklists ---------------------------------
// These are enforced centrally, against every rule's actual ingredient/
// routine text, rather than trusting each rule to be tagged correctly by
// whoever authors it. This is a deliberate defense-in-depth choice: a
// mistagged rule still can't slip an unsafe ingredient past a pregnant
// patient, because the block happens on the ingredient text itself.
const RETINOID_TERMS = [
  'tretinoin', 'adapalene', 'tazarotene', 'trifarotene', 'retinol', 'retinoid',
  'retinyl', 'hydroxypinacolone retinoate',
];
const HYDROQUINONE_TERMS = ['hydroquinone'];
const ORAL_TXA_TERMS = ['oral tranexamic acid', 'tranexamic acid (oral)'];
const PEEL_TERMS = ['chemical peel', 'glycolic acid peel'];

function containsTerm(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((t) => lower.includes(t));
}

/** Salicylic acid is only unsafe above 2% — parse the percentage rather
 * than blocking the ingredient outright. If a percentage can't be parsed
 * from the text, treat it as unsafe when caution is warranted (pregnancy/
 * breastfeeding) — ambiguity favors the patient, not the ingredient. */
function isHighDoseSalicylicAcid(text: string): boolean {
  const lower = text.toLowerCase();
  if (!lower.includes('salicylic acid')) return false;
  const match = lower.match(/salicylic acid[^%]*?(\d+(?:\.\d+)?)\s*%/);
  if (!match) return true; // can't confirm concentration — err cautious
  return parseFloat(match[1]) > 2;
}

interface SafetyProfile {
  blockRetinoids: boolean;
  blockHydroquinone: boolean;
  blockOralTXA: boolean;
  blockPeels: boolean;
  blockHighDoseSalicylicAcid: boolean;
}

function buildSafetyProfile(pregnancyStatus: PregnancyStatus | undefined, ageRange: AgeRange | null | undefined): SafetyProfile {
  const pregnantOrBreastfeeding = pregnancyStatus === 'PREGNANT' || pregnancyStatus === 'BREASTFEEDING';
  const tryingToConceive = pregnancyStatus === 'TRYING_TO_CONCEIVE';
  const under18 = ageRange === 'UNDER_18';

  return {
    // Retinoids: blocked for pregnancy/breastfeeding (teratogenic risk) and
    // for TTC (pregnancy can predate a positive test). NOT blocked outright
    // for under-18 — Adapalene 0.1% is standard first-line OTC care for
    // teen acne; the under-18 tretinoin/tazarotene/trifarotene cap below
    // handles the part of "retinoids" that does need restricting for minors.
    blockRetinoids: pregnantOrBreastfeeding || tryingToConceive,
    // Hydroquinone: blocked for pregnancy/breastfeeding/TTC (safety data
    // insufficient) and for under-18 (not appropriate for minors).
    blockHydroquinone: pregnantOrBreastfeeding || tryingToConceive || under18,
    // Oral tranexamic acid: real thrombosis risk, compounded by pregnancy's
    // own elevated clotting risk — extended to TTC for the same reason as
    // retinoids/hydroquinone above.
    blockOralTXA: pregnantOrBreastfeeding || tryingToConceive,
    // Chemical peels: pregnancy/breastfeeding only per the source protocol.
    blockPeels: pregnantOrBreastfeeding,
    // High-dose (>2%) salicylic acid: pregnancy/breastfeeding only.
    blockHighDoseSalicylicAcid: pregnantOrBreastfeeding,
  };
}

/** Returns the specific ingredient/routine strings a rule would introduce
 * that violate the patient's safety profile — empty array means the rule is
 * clear. Checks both the ingredients list and the actual routine step text,
 * since a routine step can mention an ingredient the ingredients array omits. */
function findSafetyViolations(rule: { ingredients: string[]; routine: unknown }, profile: SafetyProfile): string[] {
  const routine = rule.routine as unknown as RuleRoutine;
  const allText = [...rule.ingredients, ...(routine?.am ?? []), ...(routine?.pm ?? [])];
  const violations: string[] = [];

  for (const text of allText) {
    if (profile.blockRetinoids && containsTerm(text, RETINOID_TERMS)) violations.push(text);
    else if (profile.blockHydroquinone && containsTerm(text, HYDROQUINONE_TERMS)) violations.push(text);
    else if (profile.blockOralTXA && containsTerm(text, ORAL_TXA_TERMS)) violations.push(text);
    else if (profile.blockPeels && containsTerm(text, PEEL_TERMS)) violations.push(text);
    else if (profile.blockHighDoseSalicylicAcid && isHighDoseSalicylicAcid(text)) violations.push(text);
  }
  // Under-18: tretinoin/tazarotene/trifarotene specifically restricted, even
  // though the general retinoid block above doesn't apply to minors.
  return [...new Set(violations)];
}

/**
 * Hyper-focused, rule-based matcher (not a black-box model) so a clinic's
 * dispensing pharmacist can always see exactly which rule fired and why —
 * important for a regulated skincare/health context. Rules currently come
 * from the seeded SkincareRule dummy data; swapping in the real guide is a
 * data change only, this function doesn't need to change for that. It DOES
 * enforce hard safety blocks and the pharmacy-verification gate directly,
 * regardless of what the rule data itself says — see buildSafetyProfile and
 * the requiresLicensedPharmacy filter below.
 */
export async function matchAssessmentToRoutine(input: AssessmentInput): Promise<MatchResult> {
  const { clinicId, skinType, concerns, allergies, ageRange, pregnancyStatus, severityByConcern } = input;

  const allergyTerms = (allergies ?? '')
    .toLowerCase()
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const safetyProfile = buildSafetyProfile(pregnancyStatus, ageRange);
  const under18 = ageRange === 'UNDER_18';

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { licenseType: true, licenseVerifiedAt: true },
  });
  const clinicIsVerifiedPharmacy = clinic?.licenseType === 'PHARMACY' && clinic?.licenseVerifiedAt != null;

  const rules = await prisma.skincareRule.findMany();
  const safetyBlockedIngredients: string[] = [];

  const scored = rules
    .map((rule) => {
      const condition = rule.condition as RuleCondition;
      const ruleConcerns = (condition.concerns ?? []).map((c) => c.toUpperCase());
      const ruleSkinTypes = (condition.skinType ?? []).map((s) => s.toUpperCase());
      const ruleSeverities = (condition.severity ?? []).map((s) => s.toUpperCase());
      const avoid = (condition.avoidIngredients ?? []).map((s) => s.toLowerCase());

      const concernOverlap = concerns.filter((c) => ruleConcerns.includes(c)).length;
      const skinTypeMatch = ruleSkinTypes.includes(skinType) ? 1 : 0;

      // Severity bonus: reward a rule whose declared severity band matches
      // the patient's assessed severity for at least one overlapping
      // concern. Rules with no severity declared stay neutral (still valid
      // fallback candidates), so this never hard-excludes un-tagged rules.
      let severityBonus = 0;
      if (ruleSeverities.length > 0 && severityByConcern) {
        const anySeverityMatch = concerns
          .filter((c) => ruleConcerns.includes(c))
          .some((c) => {
            const patientSeverity = severityByConcern[c];
            return patientSeverity && ruleSeverities.includes(patientSeverity.toUpperCase());
          });
        severityBonus = anySeverityMatch ? 1.5 : -1; // mild penalty for the wrong tier of an otherwise-matching rule
      }

      const conflictsWithAllergy = allergyTerms.some((term) =>
        avoid.some((a) => a.includes(term) || term.includes(a))
      );

      // Pharmacy-tier gate: a rule requiring a licensed pharmacy is simply
      // not a candidate at all for an unverified/non-pharmacy clinic — not
      // shown, not scored, not hinted at.
      const pharmacyGateBlocked = rule.requiresLicensedPharmacy && !clinicIsVerifiedPharmacy;

      // Hard safety block: any ingredient/routine text that violates the
      // patient's current safety profile disqualifies the rule entirely.
      // Only recorded in the transparency list when the rule was actually
      // relevant to this patient (concernOverlap > 0) — an unrelated rule
      // elsewhere in the table containing hydroquinone shouldn't show up
      // as something "blocked for" a patient it was never a candidate for.
      const violations = findSafetyViolations(rule, safetyProfile);
      const under18Retinoid = under18 && rule.ingredients.some((i) =>
        containsTerm(i, ['tretinoin', 'tazarotene', 'trifarotene'])
      );
      if (concernOverlap > 0 && violations.length > 0) safetyBlockedIngredients.push(...violations);

      let score = concernOverlap * 2 + skinTypeMatch + severityBonus;
      if (conflictsWithAllergy) score -= 100;
      if (violations.length > 0 || under18Retinoid) score -= 1000;
      if (pharmacyGateBlocked) score -= 1000;

      return { rule, score, concernOverlap };
    })
    .filter((s) => s.concernOverlap > 0 && s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    // Safe fallback so the flow never dead-ends — flags for pharmacist review.
    return {
      routine: {
        am: ['Gentle cleanser', 'Fragrance-free moisturizer', 'Mineral SPF 50'],
        pm: ['Gentle cleanser', 'Fragrance-free moisturizer'],
      },
      ingredients: [],
      matchedProducts: [],
      upsells: [],
      followUpDate: addDays(new Date(), 30),
      matchedRuleNames: ['No rule matched — flagged for pharmacist review'],
      safetyBlockedIngredients: [...new Set(safetyBlockedIngredients)],
      escalationNote: null,
    };
  }

  const top = scored[0].rule;
  const routine = top.routine as unknown as RuleRoutine;
  const followUpDate = addDays(new Date(), top.followUpDays);

  // Pull in-stock products for this clinic that cover the patient's concerns.
  const matchedProducts = await prisma.product.findMany({
    where: {
      clinicId,
      stockQuantity: { gt: 0 },
      isUpsell: false,
      concerns: { hasSome: concerns },
    },
    orderBy: { name: 'asc' },
  });

  const upsellProducts = await prisma.product.findMany({
    where: {
      clinicId,
      isUpsell: true,
      concerns: { hasSome: concerns },
    },
  });

  return {
    routine,
    ingredients: top.ingredients,
    matchedProducts,
    upsells: [...new Set([...top.upsells, ...upsellProducts.map((p) => p.name)])],
    followUpDate,
    matchedRuleNames: scored.slice(0, 3).map((s) => s.rule.name),
    safetyBlockedIngredients: [...new Set(safetyBlockedIngredients)],
    escalationNote: top.escalationNote ?? null,
  };
}
