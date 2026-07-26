import { prisma } from './prisma';
import type { Concern, SkinType, Product } from '@prisma/client';
import { addDays } from 'date-fns';

interface RuleCondition {
  concerns?: string[];
  skinType?: string[];
  avoidIngredients?: string[];
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
}

export interface MatchResult {
  routine: { am: string[]; pm: string[] };
  ingredients: string[];
  matchedProducts: Product[];
  upsells: string[];
  followUpDate: Date;
  matchedRuleNames: string[];
}

/**
 * Hyper-focused, rule-based matcher (not a black-box model) so a clinic's
 * dispensing pharmacist can always see exactly which rule fired and why —
 * important for a regulated skincare/health context. Rules currently come
 * from the seeded SkincareRule dummy data; swapping in the real guide is a
 * data change only, this function doesn't need to change.
 */
export async function matchAssessmentToRoutine(input: AssessmentInput): Promise<MatchResult> {
  const { clinicId, skinType, concerns, allergies } = input;

  const allergyTerms = (allergies ?? '')
    .toLowerCase()
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const rules = await prisma.skincareRule.findMany();

  // Score each rule: +2 per overlapping concern, +1 for matching skin type,
  // -100 (disqualify) if it recommends something the patient is allergic to.
  const scored = rules
    .map((rule) => {
      const condition = rule.condition as RuleCondition;
      const ruleConcerns = (condition.concerns ?? []).map((c) => c.toUpperCase());
      const ruleSkinTypes = (condition.skinType ?? []).map((s) => s.toUpperCase());
      const avoid = (condition.avoidIngredients ?? []).map((s) => s.toLowerCase());

      const concernOverlap = concerns.filter((c) => ruleConcerns.includes(c)).length;
      const skinTypeMatch = ruleSkinTypes.includes(skinType) ? 1 : 0;

      const conflictsWithAllergy = allergyTerms.some((term) =>
        avoid.some((a) => a.includes(term) || term.includes(a))
      );

      let score = concernOverlap * 2 + skinTypeMatch;
      if (conflictsWithAllergy) score -= 100;

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
  };
}
