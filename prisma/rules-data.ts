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
  // Prescription-strength options this rule would consider if OTC tier
  // proves insufficient. ALWAYS shown to every clinic with a "Prescription
  // only" badge — never hidden. Only a verified PHARMACIST at a verified-
  // pharmacy clinic gets an actual action to dispense it; everyone else
  // (including the same clinic's support staff) sees the badge only. See
  // MASTER_ALGORITHM.md Section 0 and matching-engine.ts.
  prescriptionOptions?: string[];
}

export const rules: SkincareRuleData[] = [
    // --- ACNE ---
    {
      name: 'Acne — Mild',
      condition: { concerns: ['ACNE'], severity: ['MILD'] },
      routine: {
        am: ['Gentle cleanser', 'Niacinamide 2–5% serum', 'Lightweight oil-free moisturizer (Hyaluronic Acid + Ceramides)', 'Broad-spectrum SPF 30+'],
        pm: ['Gentle cleanser', 'Salicylic Acid 0.5–2% treatment (or Adapalene 0.1% if tolerated)', 'Oil-free moisturizer (Hyaluronic Acid + Ceramides)'],
      },
      ingredients: ['Salicylic Acid 0.5–2%', 'Adapalene 0.1%', 'Niacinamide 2–5%'],
      upsells: ['Ceramide Barrier Repair Cream', 'Zinc PCA Oil-Control Serum'],
      followUpDays: 28,
      escalationNote: 'For an isolated new breakout between applications, Benzoyl Peroxide can be dabbed directly on the spot — this is an occasional adjunct, not a replacement for the whole-area routine above (whole-area treatment addresses acne before it becomes visible; spot treatment only addresses what already has).',
    },
    {
      name: 'Acne — Moderate',
      condition: { concerns: ['ACNE'], severity: ['MODERATE'] },
      routine: {
        am: ['Gentle cleanser', 'Benzoyl Peroxide 2.5–5%', 'Niacinamide 4–5% serum', 'Oil-free moisturizer (Hyaluronic Acid + Ceramides)', 'Broad-spectrum SPF 30+'],
        pm: ['Gentle cleanser', 'Adapalene 0.1%', 'Oil-free moisturizer (Hyaluronic Acid + Ceramides)'],
      },
      ingredients: ['Benzoyl Peroxide 2.5–5%', 'Adapalene 0.1%', 'Niacinamide 4–5%'],
      upsells: ['Salicylic Acid 2% Cleanser', 'Zinc PCA Oil-Control Serum'],
      followUpDays: 56,
      escalationNote: 'If no improvement after 8–12 weeks, consider a prescription-strength retinoid or oral antibiotics — refer to a dermatologist. For an isolated new breakout between applications, Benzoyl Peroxide can also be dabbed directly on the spot as an occasional adjunct.',
      prescriptionOptions: ['Tretinoin 0.025–0.1%'],
    },
    {
      name: 'Acne — Severe',
      condition: { concerns: ['ACNE'], severity: ['SEVERE'] },
      routine: {
        am: ['Gentle cleanser', 'Benzoyl Peroxide 5–10%', 'Niacinamide serum', 'Oil-free moisturizer (Hyaluronic Acid + Ceramides)', 'Broad-spectrum SPF 30+'],
        pm: ['Gentle cleanser', 'Adapalene 0.1%', 'Oil-free moisturizer (Hyaluronic Acid + Ceramides)'],
      },
      ingredients: ['Benzoyl Peroxide 5–10%', 'Adapalene 0.1%', 'Niacinamide'],
      upsells: ['Salicylic Acid 2% Cleanser', 'Zinc PCA Oil-Control Serum'],
      followUpDays: 30,
      escalationNote: 'Severe/cystic pattern — this OTC combination is a bridge, not a resolution. Refer to a dermatologist for oral isotretinoin if cysts/nodules are present, or if there is no improvement within 4 weeks. For an isolated new breakout between applications, Benzoyl Peroxide can also be dabbed directly on the spot as an occasional adjunct.',
      prescriptionOptions: ['Tretinoin 0.025–0.1%', 'Tazarotene 0.05–0.1%'],
    },
    {
      name: 'Acne — Pregnancy-Safe',
      condition: { concerns: ['ACNE'] }, // no severity tag — becomes top scorer only once pregnancy/TTC/breastfeeding disqualifies the Adapalene-containing rules above
      routine: {
        am: ['Gentle cleanser', 'Azelaic Acid 10% serum', 'Niacinamide serum', 'Fragrance-free moisturizer (Ceramides + Glycerin)', 'Mineral SPF 30+ (Zinc Oxide/Titanium Dioxide)'],
        pm: ['Gentle cleanser', 'Benzoyl Peroxide 2.5% spot treatment', 'Fragrance-free moisturizer (Ceramides + Glycerin)'],
      },
      ingredients: ['Azelaic Acid 10–15%', 'Benzoyl Peroxide 2.5–5%', 'Niacinamide'],
      upsells: ['Ceramide Barrier Repair Cream'],
      followUpDays: 28,
      escalationNote: 'Pregnancy-safe routine. If acne is severe or not improving, refer to OB-GYN or dermatologist before adding anything further.',
    },
    // --- HYPERPIGMENTATION --- (hydroquinone intentionally never appears as
    // a recommended OTC ingredient above 2% anywhere below — see
    // MASTER_ALGORITHM.md Section 0. Note this also means these rules never
    // trip the pregnancy hydroquinone/retinoid block, so no separate
    // pregnancy-safe variant is needed here.)
    {
      name: 'Hyperpigmentation — Mild',
      condition: { concerns: ['HYPERPIGMENTATION'], severity: ['MILD'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C 10–20% + Ferulic Acid serum', 'Niacinamide moisturizer', 'Tinted SPF 30+ with iron oxides'],
        pm: ['Gentle cleanser', 'Azelaic Acid 10% serum', 'Moisturizer (Hyaluronic Acid + Ceramides + Niacinamide)'],
      },
      // Single-active start is deliberate, not a lesser routine — Section 2's
      // own Treatment Duration Guidelines calls for "continue; consider
      // adding a second OTC active" only if Mild doesn't improve in 4–8
      // weeks. Tranexamic Acid is the documented next step (see
      // escalationNote below), not something to push on day one.
      ingredients: ['Azelaic Acid 10%', 'Vitamin C 10–20%', 'Niacinamide'],
      upsells: ['Alpha Arbutin Brightening Serum'],
      followUpDays: 28,
      escalationNote: 'If no visible improvement after 4–8 weeks, adding Tranexamic Acid 3–5% is the evidence-based next step — Tranexamic Acid + Azelaic Acid + Niacinamide is the strongest available OTC-tier combination for pigmentation (MASTER_ALGORITHM.md Section 2).',
    },
    {
      name: 'Hyperpigmentation — Moderate',
      condition: { concerns: ['HYPERPIGMENTATION'], severity: ['MODERATE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Ferulic Acid serum', 'Niacinamide moisturizer', 'Tinted SPF 50+ with iron oxides — non-negotiable'],
        pm: ['Gentle cleanser', 'Tranexamic Acid 3–5% + Azelaic Acid 10% + Niacinamide serum', 'Moisturizer (Hyaluronic Acid + Ceramides + Niacinamide)'],
      },
      // Tranexamic Acid + Azelaic Acid + Niacinamide is Section 2's own
      // "best available OTC-tier combination for pigmentation + redness" —
      // this is the core routine, not an upsell. Deliberately no
      // Hydroquinone anywhere in ingredients/routine text: an earlier
      // version embedded it as an "OR" alternative inside this same step,
      // which meant the matching engine's hard safety filter (which scans
      // ingredients + routine text for any blocked term, all-or-nothing)
      // disqualified this ENTIRE rule for pregnant/breastfeeding/TTC/
      // under-18 patients — even though the safe Tranexamic+Azelaic option
      // was sitting right there. That's a confirmed bug (would have failed
      // TEST_SCENARIOS.md Priority 1 #3), not intended behavior — fixed by
      // keeping this rule's ingredients/routine 100% free of any blocked
      // term, full stop. 2% Hydroquinone remains a legitimate documented
      // OTC option in MASTER_ALGORITHM.md Section 2, just not force-fit
      // into this specific rule; a pharmacist can still reach for it
      // directly, informed by the doc, without the app needing to
      // algorithmically thread it through every rule.
      ingredients: ['Tranexamic Acid 3–5%', 'Azelaic Acid 10%', 'Niacinamide', 'Vitamin C'],
      upsells: ['Alpha Arbutin Brightening Serum'],
      followUpDays: 56,
      escalationNote: 'If no improvement after 12–16 weeks on this combination, may benefit from prescription-strength intervention — refer for pharmacy/dermatologist evaluation.',
      prescriptionOptions: ['Hydroquinone 4% (short-course)'],
    },
    {
      name: 'Hyperpigmentation — Severe',
      condition: { concerns: ['HYPERPIGMENTATION'], severity: ['SEVERE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Ferulic Acid serum', 'Niacinamide moisturizer', 'Tinted SPF 50+ with iron oxides — non-negotiable'],
        pm: ['Gentle cleanser', 'Tranexamic Acid 3–5% + Azelaic Acid 10% + Niacinamide serum', 'Moisturizer (Hyaluronic Acid + Ceramides + Niacinamide)'],
      },
      // Same fix and same reasoning as the Moderate rule above.
      ingredients: ['Tranexamic Acid 3–5%', 'Azelaic Acid 10%', 'Niacinamide', 'Vitamin C'],
      upsells: ['Alpha Arbutin Brightening Serum'],
      followUpDays: 30,
      escalationNote: 'Severe/widespread pigmentation, possibly melasma. May benefit from above-2% prescription-strength intervention if unresponsive to this combination.',
      prescriptionOptions: ['Hydroquinone 4% (short-course)'],
    },
    {
      name: 'Hyperpigmentation — Severe (Pharmacy-Verified)',
      condition: { concerns: ['HYPERPIGMENTATION'], severity: ['SEVERE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Ferulic Acid serum', 'Niacinamide moisturizer', 'Tinted SPF 50+ with iron oxides — non-negotiable'],
        pm: ['Gentle cleanser', 'Tranexamic Acid 3–5% + Azelaic Acid 10% serum', 'Moisturizer (Hyaluronic Acid + Ceramides + Niacinamide)'],
      },
      ingredients: ['Tranexamic Acid 3–5%', 'Azelaic Acid 10%', 'Niacinamide', 'Vitamin C'],
      upsells: ['Alpha Arbutin Brightening Serum'],
      followUpDays: 30,
      requiresLicensedPharmacy: true,
      escalationNote: 'Severe/widespread pigmentation, possibly melasma, not responding to 2% OTC hydroquinone or the Azelaic/Tranexamic combination. Above-2% options a pharmacist may consider dispensing: 4% hydroquinone short-course, or a compounded triple-combination formula (hydroquinone + tretinoin + a mild corticosteroid) — never continuous beyond 3–4 months.',
      prescriptionOptions: ['Hydroquinone 4% (short-course)', 'Triple-combination cream (Hydroquinone + Tretinoin + mild corticosteroid) — compounded'],
    },
    // --- SUN DAMAGE --- (nothing here is on any blocklist, so no
    // pregnancy-safe variant is needed)
    {
      name: 'Sun Damage — Mild',
      condition: { concerns: ['SUN_DAMAGE'], severity: ['MILD'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Vitamin E + Ferulic Acid serum', 'Lightweight moisturizer (Hyaluronic Acid + Niacinamide)', 'Broad-spectrum SPF 30+, reapply every 2 hours outdoors'],
        pm: ['Gentle cleanser', 'Niacinamide serum', 'Moisturizer (Hyaluronic Acid + Ceramides + Niacinamide)'],
      },
      ingredients: ['Vitamin C 10–20%', 'Vitamin E', 'Ferulic Acid', 'Niacinamide'],
      upsells: ['Green Tea Antioxidant Serum'],
      followUpDays: 30,
    },
    {
      name: 'Sun Damage — Moderate',
      condition: { concerns: ['SUN_DAMAGE'], severity: ['MODERATE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Ferulic Acid + Vitamin E serum', 'Green Tea Extract moisturizer', 'Broad-spectrum SPF 50, reapply every 2 hours'],
        pm: ['Gentle cleanser', 'Niacinamide serum', 'Barrier-repair moisturizer (Ceramides + Hyaluronic Acid)'],
      },
      ingredients: ['Vitamin C 10–20%', 'Green Tea Extract (EGCG)', 'Niacinamide', 'Ferulic Acid'],
      // SPF is already mandatory AM, and Green Tea Extract is already the
      // routine's own moisturizer active — neither belongs as an upsell.
      upsells: ['Resveratrol Antioxidant Serum', 'Baicalin Repair Serum'],
      followUpDays: 42,
    },
    {
      name: 'Sun Damage — Severe',
      condition: { concerns: ['SUN_DAMAGE'], severity: ['SEVERE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Ferulic Acid + Vitamin E serum', 'Green Tea Extract moisturizer', 'Broad-spectrum SPF 50, reapply every 2 hours'],
        pm: ['Gentle cleanser', 'Niacinamide serum', 'Barrier-repair moisturizer (Ceramides + Hyaluronic Acid)'],
      },
      ingredients: ['Vitamin C 10–20%', 'Green Tea Extract', 'Niacinamide', 'Ferulic Acid'],
      upsells: ['Resveratrol Antioxidant Serum', 'Baicalin Repair Serum'],
      followUpDays: 30,
      escalationNote: 'Visible damage with inconsistent sunscreen use — daily SPF is the single highest-leverage change here. If broken capillaries or significant texture change are present, consider referral for in-office treatment (e.g. laser) alongside this routine.',
    },
    // --- AGING ---
    {
      name: 'Aging — Mild (Fine Lines)',
      condition: { concerns: ['AGING'], severity: ['MILD'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C 10–20% serum', 'Peptide moisturizer', 'Broad-spectrum SPF 30+'],
        pm: ['Gentle cleanser', 'Retinol 0.3% or Retinaldehyde 0.05% — start 2x/week, build up gradually', 'Hyaluronic Acid + Ceramide moisturizer'],
      },
      // Retinaldehyde and Retinol are both true retinoids (see
      // MASTER_ALGORITHM.md Section 4) — Retinaldehyde needs only one
      // metabolic conversion step to reach retinoic acid vs. Retinol's two,
      // and dermatologist-reviewed sources rank it as the more potent of
      // the two OTC options at equivalent concentration (Skin Wellness
      // Dermatology, Dr. Elyse Love). Mild tier uses the lower end of each
      // range as the conservative starting point.
      ingredients: ['Vitamin C 10–20%', 'Peptides', 'Retinaldehyde 0.05%', 'Retinol 0.3%', 'Hyaluronic Acid'],
      upsells: ['Bakuchiol Retinol-Alternative Serum'],
      followUpDays: 84,
    },
    {
      name: 'Aging — Moderate (Deeper Wrinkles)',
      condition: { concerns: ['AGING'], severity: ['MODERATE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Vitamin E + Ferulic Acid serum', 'Peptide moisturizer', 'Broad-spectrum SPF 30+'],
        pm: ['Gentle cleanser', 'Retinaldehyde 0.05–0.1% or Retinol 0.3–0.5%, nightly once tolerated', 'Hyaluronic Acid + Ceramide + Peptide night cream'],
      },
      ingredients: ['Vitamin C', 'Peptides (Matrixyl, Argireline)', 'Retinaldehyde 0.05–0.1%', 'Retinol 0.3–0.5%', 'Ceramides'],
      upsells: ['Coenzyme Q10 Serum'],
      followUpDays: 120,
      escalationNote: 'If limited improvement after 24 weeks, consider prescription-strength Tretinoin — refer to a dermatologist.',
      prescriptionOptions: ['Tretinoin 0.025–0.1%'],
    },
    {
      name: 'Aging — Severe (Loss of Firmness)',
      condition: { concerns: ['AGING'], severity: ['SEVERE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Vitamin E + Ferulic Acid serum', 'Peptide moisturizer', 'Broad-spectrum SPF 30+'],
        pm: ['Gentle cleanser', 'Retinaldehyde 0.1% or Retinol 0.5–1%, nightly once tolerated', 'Hyaluronic Acid + Ceramide + Peptide + CoQ10 night cream'],
      },
      ingredients: ['Vitamin C', 'Peptides', 'Retinaldehyde 0.1%', 'Retinol 0.5–1%', 'Coenzyme Q10', 'Ceramides'],
      // CoQ10 already in this routine's own night cream — a genuinely new
      // addition instead, also documented in Section 4.
      upsells: ['Curcumin Anti-Inflammatory Serum'],
      followUpDays: 120,
      escalationNote: 'Significant firmness loss — this routine helps but has a ceiling. Consider referral for in-office collagen-stimulating treatment (e.g. microneedling, laser) alongside the daily routine.',
      prescriptionOptions: ['Tretinoin 0.025–0.1%'],
    },
    {
      name: 'Aging — Pregnancy-Safe',
      condition: { concerns: ['AGING'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C 10–20% serum', 'Hyaluronic Acid + Peptide moisturizer', 'Mineral SPF 30+'],
        pm: ['Gentle cleanser', 'Bakuchiol 0.5–2% (retinol alternative, pregnancy-safe)', 'Ceramide moisturizer'],
      },
      ingredients: ['Bakuchiol 0.5–2%', 'Vitamin C', 'Peptides', 'Hyaluronic Acid'],
      upsells: ['Ceramide Barrier Repair Cream'],
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
      upsells: ['Ceramide Barrier Repair Cream', 'Vitamin C + Ferulic Acid Serum'],
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
        am: ['Gentle cleanser', 'Niacinamide + Vitamin C serum', 'Oil-free moisturizer (Hyaluronic Acid + Ceramides)', 'Tinted SPF 30+ with iron oxides'],
        pm: ['Gentle cleanser', 'Azelaic Acid 10–15% (treats both active acne and post-acne marks)', 'Oil-free moisturizer (Hyaluronic Acid + Ceramides)'],
      },
      ingredients: ['Azelaic Acid 10–15%', 'Niacinamide', 'Vitamin C'],
      upsells: ['Alpha Arbutin Brightening Serum'],
      followUpDays: 42,
    },
    {
      name: 'Combination — Acne + Aging',
      condition: { concerns: ['ACNE', 'AGING'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Niacinamide serum', 'Oil-free moisturizer (Hyaluronic Acid + Ceramides)', 'Broad-spectrum SPF 30+'],
        pm: ['Gentle cleanser', 'Adapalene 0.1% (serves both acne and early anti-aging)', 'Oil-free moisturizer (Hyaluronic Acid + Ceramides)'],
      },
      ingredients: ['Adapalene 0.1%', 'Niacinamide', 'Vitamin C'],
      upsells: ['Salicylic Acid 2% Cleanser', 'Bakuchiol Retinol-Alternative Serum'],
      followUpDays: 56,
    },
    {
      name: 'Combination — Hyperpigmentation + Sun Damage',
      condition: { concerns: ['HYPERPIGMENTATION', 'SUN_DAMAGE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Ferulic Acid + Vitamin E serum', 'Niacinamide moisturizer', 'Tinted SPF 50+ with iron oxides — non-negotiable'],
        pm: ['Gentle cleanser', 'Tranexamic Acid + Azelaic Acid serum', 'Moisturizer (Hyaluronic Acid + Ceramides + Niacinamide)'],
      },
      ingredients: ['Tranexamic Acid 3–5%', 'Azelaic Acid', 'Vitamin C', 'Niacinamide'],
      // Tranexamic Acid is already core PM here, and tinted SPF is already
      // mandatory AM — neither belongs in upsells (a mandatory step framed
      // as an optional add-on is exactly the confusion to avoid). Genuine
      // add-ons only, both already-vetted and not duplicating the routine:
      upsells: ['Alpha Arbutin Brightening Serum', 'Green Tea Antioxidant Serum'],
      followUpDays: 42,
    },
    {
      name: 'Combination — Aging + Sun Damage',
      condition: { concerns: ['AGING', 'SUN_DAMAGE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Vitamin E + Ferulic Acid serum', 'Peptide moisturizer', 'Broad-spectrum SPF 50+'],
        pm: ['Gentle cleanser', 'Retinaldehyde 0.05–0.1% or Retinol 0.3–0.5% — build up gradually', 'Hyaluronic Acid + Ceramide moisturizer'],
      },
      ingredients: ['Vitamin C', 'Vitamin E', 'Ferulic Acid', 'Peptides', 'Retinaldehyde 0.05–0.1%', 'Retinol 0.3–0.5%'],
      // Retinoid and SPF are both already core here — neither belongs as
      // an upsell. Genuine additions instead:
      upsells: ['Coenzyme Q10 Serum', 'Resveratrol Antioxidant Serum'],
      followUpDays: 56,
    },
  ];
