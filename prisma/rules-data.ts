// Single source of truth for the real SkincareRule data, from MASTER_ALGORITHM.md.
// Imported by prisma/seed.ts (loads it into the DB via Prisma) and by
// scripts/generate-seed-sql.ts (emits the same data as raw SQL, for
// clinics on Render's free tier where the Shell tab isn't available).

export interface SkincareRuleData {
  name: string;
  condition: object;
  routine: object;
  ingredients: string[];
  upsells: string[];
  followUpDays: number;
  requiresLicensedPharmacy?: boolean;
  escalationNote?: string;
}

export const rules: SkincareRuleData[] = [
    // --- ACNE ---
    {
      name: 'Acne — Mild',
      condition: { concerns: ['ACNE'], severity: ['MILD'] },
      routine: {
        am: ['Gentle cleanser', 'Niacinamide 2–5% serum', 'Lightweight oil-free moisturizer', 'Broad-spectrum SPF 30+'],
        pm: ['Gentle cleanser', 'Salicylic Acid 0.5–2% treatment (or Adapalene 0.1% if tolerated)', 'Oil-free moisturizer'],
      },
      ingredients: ['Salicylic Acid 0.5–2%', 'Adapalene 0.1%', 'Niacinamide 2–5%'],
      upsells: ['Ceramide Barrier Repair Cream'],
      followUpDays: 28,
    },
    {
      name: 'Acne — Moderate',
      condition: { concerns: ['ACNE'], severity: ['MODERATE'] },
      routine: {
        am: ['Gentle cleanser', 'Benzoyl Peroxide 2.5–5%', 'Niacinamide 4–5% serum', 'Oil-free moisturizer', 'Broad-spectrum SPF 30+'],
        pm: ['Gentle cleanser', 'Adapalene 0.1%', 'Oil-free moisturizer'],
      },
      ingredients: ['Benzoyl Peroxide 2.5–5%', 'Adapalene 0.1%', 'Niacinamide 4–5%'],
      upsells: ['Salicylic Acid 2% Cleanser'],
      followUpDays: 56,
      escalationNote: 'If no improvement after 8–12 weeks, consider a prescription-strength retinoid or oral antibiotics — refer to a dermatologist.',
    },
    {
      name: 'Acne — Severe',
      condition: { concerns: ['ACNE'], severity: ['SEVERE'] },
      routine: {
        am: ['Gentle cleanser', 'Benzoyl Peroxide 5–10%', 'Niacinamide serum', 'Oil-free moisturizer', 'Broad-spectrum SPF 30+'],
        pm: ['Gentle cleanser', 'Adapalene 0.1%', 'Oil-free moisturizer'],
      },
      ingredients: ['Benzoyl Peroxide 5–10%', 'Adapalene 0.1%', 'Niacinamide'],
      upsells: ['Salicylic Acid 2% Cleanser'],
      followUpDays: 30,
      escalationNote: 'Severe/cystic pattern — this OTC combination is a bridge, not a resolution. Refer to a dermatologist for prescription-strength retinoid or oral isotretinoin if cysts/nodules are present, or if there is no improvement within 4 weeks.',
    },
    {
      name: 'Acne — Pregnancy-Safe',
      condition: { concerns: ['ACNE'] }, // no severity tag — becomes top scorer only once pregnancy/TTC/breastfeeding disqualifies the Adapalene-containing rules above
      routine: {
        am: ['Gentle cleanser', 'Azelaic Acid 10% serum', 'Niacinamide serum', 'Mineral SPF 30+ (Zinc Oxide/Titanium Dioxide)'],
        pm: ['Gentle cleanser', 'Benzoyl Peroxide 2.5% spot treatment', 'Fragrance-free moisturizer'],
      },
      ingredients: ['Azelaic Acid 10–15%', 'Benzoyl Peroxide 2.5–5%', 'Niacinamide'],
      upsells: [],
      followUpDays: 28,
      escalationNote: 'Pregnancy-safe routine. If acne is severe or not improving, refer to OB-GYN or dermatologist before adding anything further.',
    },
    // --- HYPERPIGMENTATION --- (hydroquinone intentionally never appears as
    // a recommended ingredient anywhere below — see MASTER_ALGORITHM.md
    // Section 0. Note this also means these rules never trip the pregnancy
    // hydroquinone/retinoid block, so no separate pregnancy-safe variant is
    // needed here.)
    {
      name: 'Hyperpigmentation — Mild',
      condition: { concerns: ['HYPERPIGMENTATION'], severity: ['MILD'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C 10–20% + Ferulic Acid serum', 'Niacinamide moisturizer', 'Tinted SPF 30+ with iron oxides'],
        pm: ['Gentle cleanser', 'Azelaic Acid 10% serum', 'Moisturizer'],
      },
      ingredients: ['Azelaic Acid 10%', 'Vitamin C 10–20%', 'Niacinamide'],
      upsells: ['Tranexamic Acid Dark Spot Serum'],
      followUpDays: 28,
    },
    {
      name: 'Hyperpigmentation — Moderate',
      condition: { concerns: ['HYPERPIGMENTATION'], severity: ['MODERATE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Ferulic Acid serum', 'Niacinamide moisturizer', 'Tinted SPF 50+ with iron oxides — non-negotiable'],
        pm: ['Gentle cleanser', 'Tranexamic Acid 3–5% + Azelaic Acid 10% serum, OR Hydroquinone 2% (OTC ceiling — max 3–4 months continuous use)', 'Moisturizer'],
      },
      // Hydroquinone here means this rule is correctly excluded by the
      // matching engine's hard-safety filter for pregnancy/breastfeeding/
      // TTC/under-18 patients — they fall back to the Azelaic-based Mild
      // rule automatically, which contains no blocked ingredients.
      ingredients: ['Tranexamic Acid 3–5%', 'Azelaic Acid 10%', 'Hydroquinone 2%', 'Niacinamide', 'Vitamin C'],
      upsells: ['Tranexamic Acid Dark Spot Serum'],
      followUpDays: 56,
      escalationNote: 'If no improvement after 12–16 weeks, may benefit from prescription-strength (>2%) intervention — refer for pharmacy/dermatologist evaluation.',
    },
    {
      name: 'Hyperpigmentation — Severe',
      condition: { concerns: ['HYPERPIGMENTATION'], severity: ['SEVERE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Ferulic Acid serum', 'Niacinamide moisturizer', 'Tinted SPF 50+ with iron oxides — non-negotiable'],
        pm: ['Gentle cleanser', 'Tranexamic Acid 3–5% + Azelaic Acid 10% serum, OR Hydroquinone 2% (OTC ceiling — max 3–4 months continuous use)', 'Moisturizer'],
      },
      ingredients: ['Tranexamic Acid 3–5%', 'Azelaic Acid 10%', 'Hydroquinone 2%', 'Niacinamide', 'Vitamin C'],
      upsells: ['Tranexamic Acid Dark Spot Serum'],
      followUpDays: 30,
      escalationNote: 'Severe/widespread pigmentation, possibly melasma — 2% hydroquinone or this Azelaic/Tranexamic combination are both reasonable OTC starting points, not necessarily the ceiling. May benefit from above-2% prescription-strength intervention if unresponsive — requires assessment and prescription from a licensed physician before dispensing.',
    },
    {
      name: 'Hyperpigmentation — Severe (Pharmacy-Verified)',
      condition: { concerns: ['HYPERPIGMENTATION'], severity: ['SEVERE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Ferulic Acid serum', 'Niacinamide moisturizer', 'Tinted SPF 50+ with iron oxides — non-negotiable'],
        pm: ['Gentle cleanser', 'Tranexamic Acid 3–5% + Azelaic Acid 10% serum', 'Moisturizer'],
      },
      ingredients: ['Tranexamic Acid 3–5%', 'Azelaic Acid 10%', 'Niacinamide', 'Vitamin C'],
      upsells: ['Tranexamic Acid Dark Spot Serum'],
      followUpDays: 30,
      requiresLicensedPharmacy: true,
      escalationNote: 'Severe/widespread pigmentation, possibly melasma, not responding to 2% OTC hydroquinone or the Azelaic/Tranexamic combination. Above-2% prescription-tier options a physician may consider: 4% hydroquinone short-course, or a compounded triple-combination formula (hydroquinone + tretinoin + a mild corticosteroid) — never dispensed without a valid prescription and physician supervision, and never continuous beyond 3–4 months.',
    },
    // --- SUN DAMAGE --- (nothing here is on any blocklist, so no
    // pregnancy-safe variant is needed)
    {
      name: 'Sun Damage — Mild',
      condition: { concerns: ['SUN_DAMAGE'], severity: ['MILD'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Vitamin E + Ferulic Acid serum', 'Lightweight moisturizer', 'Broad-spectrum SPF 30+, reapply every 2 hours outdoors'],
        pm: ['Gentle cleanser', 'Niacinamide serum', 'Moisturizer'],
      },
      ingredients: ['Vitamin C 10–20%', 'Vitamin E', 'Ferulic Acid', 'Niacinamide'],
      upsells: ['Mineral SPF 50 Sunscreen'],
      followUpDays: 30,
    },
    {
      name: 'Sun Damage — Moderate',
      condition: { concerns: ['SUN_DAMAGE'], severity: ['MODERATE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Ferulic Acid + Vitamin E serum', 'Green Tea Extract moisturizer', 'Broad-spectrum SPF 50, reapply every 2 hours'],
        pm: ['Gentle cleanser', 'Niacinamide serum', 'Barrier-repair moisturizer'],
      },
      ingredients: ['Vitamin C 10–20%', 'Green Tea Extract (EGCG)', 'Niacinamide', 'Ferulic Acid'],
      upsells: ['Mineral SPF 50 Sunscreen'],
      followUpDays: 42,
    },
    {
      name: 'Sun Damage — Severe',
      condition: { concerns: ['SUN_DAMAGE'], severity: ['SEVERE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Ferulic Acid + Vitamin E serum', 'Green Tea Extract moisturizer', 'Broad-spectrum SPF 50, reapply every 2 hours'],
        pm: ['Gentle cleanser', 'Niacinamide serum', 'Barrier-repair moisturizer'],
      },
      ingredients: ['Vitamin C 10–20%', 'Green Tea Extract', 'Niacinamide', 'Ferulic Acid'],
      upsells: ['Mineral SPF 50 Sunscreen'],
      followUpDays: 30,
      escalationNote: 'Visible damage with inconsistent sunscreen use — daily SPF is the single highest-leverage change here. If broken capillaries or significant texture change are present, consider referral for in-office treatment (e.g. laser) alongside this routine.',
    },
    // --- AGING ---
    {
      name: 'Aging — Mild (Fine Lines)',
      condition: { concerns: ['AGING'], severity: ['MILD'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C 10–20% serum', 'Peptide moisturizer', 'Broad-spectrum SPF 30+'],
        pm: ['Gentle cleanser', 'Retinaldehyde or low-strength Retinol — start 2x/week, build up', 'Hyaluronic Acid + Ceramide moisturizer'],
      },
      ingredients: ['Vitamin C 10–20%', 'Peptides', 'Retinaldehyde', 'Hyaluronic Acid'],
      upsells: ['Retinal 0.1% Night Cream'],
      followUpDays: 84,
    },
    {
      name: 'Aging — Moderate (Deeper Wrinkles)',
      condition: { concerns: ['AGING'], severity: ['MODERATE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Vitamin E + Ferulic Acid serum', 'Peptide moisturizer', 'Broad-spectrum SPF 30+'],
        pm: ['Gentle cleanser', 'Retinaldehyde/Retinol, nightly once tolerated', 'Hyaluronic Acid + Ceramide + Peptide night cream'],
      },
      ingredients: ['Vitamin C', 'Peptides (Matrixyl, Argireline)', 'Retinaldehyde', 'Ceramides'],
      upsells: ['Retinal 0.1% Night Cream'],
      followUpDays: 120,
      escalationNote: 'If limited improvement after 24 weeks, consider prescription-strength Tretinoin — refer to a dermatologist.',
    },
    {
      name: 'Aging — Severe (Loss of Firmness)',
      condition: { concerns: ['AGING'], severity: ['SEVERE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Vitamin E + Ferulic Acid serum', 'Peptide moisturizer', 'Broad-spectrum SPF 30+'],
        pm: ['Gentle cleanser', 'Retinaldehyde/Retinol, nightly once tolerated', 'Hyaluronic Acid + Ceramide + Peptide + CoQ10 night cream'],
      },
      ingredients: ['Vitamin C', 'Peptides', 'Retinaldehyde', 'Coenzyme Q10', 'Ceramides'],
      upsells: ['Retinal 0.1% Night Cream'],
      followUpDays: 120,
      escalationNote: 'Significant firmness loss — this routine helps but has a ceiling. Consider referral for in-office collagen-stimulating treatment (e.g. microneedling, laser) alongside the daily routine, and prescription-strength Tretinoin if not already in use.',
    },
    {
      name: 'Aging — Pregnancy-Safe',
      condition: { concerns: ['AGING'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C 10–20% serum', 'Hyaluronic Acid + Peptide moisturizer', 'Mineral SPF 30+'],
        pm: ['Gentle cleanser', 'Bakuchiol 0.5–2% (retinol alternative, pregnancy-safe)', 'Ceramide moisturizer'],
      },
      ingredients: ['Bakuchiol 0.5–2%', 'Vitamin C', 'Peptides', 'Hyaluronic Acid'],
      upsells: [],
      followUpDays: 84,
      escalationNote: 'Pregnancy-safe routine — retinoids can resume postpartum/after breastfeeding if desired.',
    },
    // --- GLOWING SKIN --- (one rule: the six-step framework. Splitting
    // this by "routine complexity" the way severity splits the other 4
    // concerns isn't meaningful here — there's no clinical severity axis to
    // score against, so a Beginner/Advanced split would just tie in the
    // matcher. Complexity is better handled as UI/copy on the results page.)
    {
      name: 'Glowing Skin — Six-Step Routine',
      condition: { concerns: ['GLOWING_SKIN'] },
      routine: {
        am: ['Gentle cleanser (Glycerin, Panthenol)', 'Vitamin C 10–20% + Ferulic Acid + Vitamin E serum', 'Hyaluronic Acid + Ceramide + Niacinamide moisturizer', 'Broad-spectrum SPF 30–50+ (tinted if also addressing hyperpigmentation)'],
        pm: ['Gentle cleanser', 'Hyaluronic Acid + Ceramide + Niacinamide moisturizer', 'Night cream or mask — Hyaluronic Acid + Peptides + Ceramides'],
      },
      ingredients: ['Niacinamide', 'Ceramides', 'Hyaluronic Acid', 'Vitamin C', 'Glycerin', 'Panthenol'],
      upsells: ['Ceramide Barrier Repair Cream'],
      followUpDays: 30,
    },
    // --- COMBINATION RULES --- (Section 8 of MASTER_ALGORITHM.md — these
    // score higher than any single-concern rule whenever both concerns are
    // selected, since concernOverlap counts double, so the matcher prefers
    // the combined routine over dropping one concern silently.)
    {
      name: 'Combination — Acne + Hyperpigmentation',
      condition: { concerns: ['ACNE', 'HYPERPIGMENTATION'] },
      routine: {
        am: ['Gentle cleanser', 'Niacinamide + Vitamin C serum', 'Oil-free moisturizer', 'Tinted SPF 30+ with iron oxides'],
        pm: ['Gentle cleanser', 'Azelaic Acid 10–15% (treats both active acne and post-acne marks)', 'Oil-free moisturizer'],
      },
      ingredients: ['Azelaic Acid 10–15%', 'Niacinamide', 'Vitamin C'],
      upsells: ['Tranexamic Acid Dark Spot Serum'],
      followUpDays: 42,
    },
    {
      name: 'Combination — Acne + Aging',
      condition: { concerns: ['ACNE', 'AGING'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Niacinamide serum', 'Oil-free moisturizer', 'Broad-spectrum SPF 30+'],
        pm: ['Gentle cleanser', 'Adapalene 0.1% (serves both acne and early anti-aging)', 'Oil-free moisturizer'],
      },
      ingredients: ['Adapalene 0.1%', 'Niacinamide', 'Vitamin C'],
      upsells: ['Salicylic Acid 2% Cleanser'],
      followUpDays: 56,
    },
    {
      name: 'Combination — Hyperpigmentation + Sun Damage',
      condition: { concerns: ['HYPERPIGMENTATION', 'SUN_DAMAGE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Ferulic Acid + Vitamin E serum', 'Niacinamide moisturizer', 'Tinted SPF 50+ with iron oxides — non-negotiable'],
        pm: ['Gentle cleanser', 'Tranexamic Acid + Azelaic Acid serum', 'Moisturizer'],
      },
      ingredients: ['Tranexamic Acid 3–5%', 'Azelaic Acid', 'Vitamin C', 'Niacinamide'],
      upsells: ['Tranexamic Acid Dark Spot Serum', 'Mineral SPF 50 Sunscreen'],
      followUpDays: 42,
    },
    {
      name: 'Combination — Aging + Sun Damage',
      condition: { concerns: ['AGING', 'SUN_DAMAGE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Vitamin E + Ferulic Acid serum', 'Peptide moisturizer', 'Broad-spectrum SPF 50+'],
        pm: ['Gentle cleanser', 'Retinaldehyde — build up gradually', 'Hyaluronic Acid + Ceramide moisturizer'],
      },
      ingredients: ['Vitamin C', 'Vitamin E', 'Ferulic Acid', 'Peptides', 'Retinaldehyde'],
      upsells: ['Retinal 0.1% Night Cream', 'Mineral SPF 50 Sunscreen'],
      followUpDays: 56,
    },
  ];
