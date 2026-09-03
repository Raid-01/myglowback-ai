# MyGlowBack.AI — Master Clinical Algorithm

**Status: working draft.** This consolidates the original protocol (Sections
1–6), the new Section 7 (age & hormonal stage), and the corrections flagged
during review — all in one place, nothing omitted. Every correction is
marked **[CORRECTED]** or **[NEW]** so it's clear what changed from the
original submission and why.

---

## Editorial Summary — What Changed and Why

1. **Hydroquinone correction (revised from an earlier, overly-conservative
   read): 2% is the legal OTC ceiling in Nigeria, not a full ban.**
   Multiple current, independent sources — including a NAFDAC state
   coordinator's own July 2025 statement and a July 2026 industry
   article — consistently confirm NAFDAC's 2019 Cosmetic Products
   (Prohibition of Bleaching Agents) Regulations cap hydroquinone at 2% for
   OTC cosmetic sale, not prohibit it entirely. Only concentrations *above*
   2% (4% hydroquinone, and Kligman's/triple-combination formulas, which
   also always involve prescription-only tretinoin regardless of HQ
   strength) need the prescription-tier gate. Hydroquinone at ≤2% is now a
   real OTC-tier recommendation option for hyperpigmentation, alongside
   Azelaic Acid and Tranexamic Acid — not a mandatory swap-out for them.
   **This does not change the pregnancy/breastfeeding/trying-to-conceive
   and under-18 blocks below** — those exclude hydroquinone at any
   concentration regardless of the OTC/Rx line, for unrelated safety
   reasons (insufficient pregnancy safety data; not appropriate for
   minors).
2. **Kojic acid capped at 1%** in every OTC-tier rule, matching NAFDAC's
   Cosmetic Products (Prohibition of Bleaching Agents) Regulations 2019.
   Concentrations above that require the same prescription-tier framing as
   hydroquinone.
3. **Teen adapalene correction.** Section 7's original framing ("avoid
   retinoids unless prescribed" for puberty) has been softened —
   Adapalene 0.1% is standard first-line OTC care for adolescent acne, not
   something to gate behind a prescription.
4. **"Trying to conceive" safety block extended.** Originally only
   restricted retinoids; now also restricts hydroquinone and oral
   tranexamic acid, for the same reason (pregnancy can predate a positive
   test).
5. **Age bands clarified as a fallback signal, not the primary one.** The
   original document gave overlapping/contradictory age ranges for
   reproductive years, perimenopause, menopause, and post-menopause across
   different tables. The direct hormonal-stage question (Assessment
   Questionnaire, Part 1.4) is the source of truth; age only fills gaps
   when that question is skipped.
6. **Fitzpatrick / skin-of-color considerations threaded throughout** — new
   Section 9.
7. **Combination-concern guidance added** — new Section 8 — since real
   patients rarely have exactly one concern, and two single-concern rules
   don't always compose safely on their own.
8. **Topical collagen's mechanism softened.** The literature is more
   contested than the original framing suggests — topical collagen
   molecules are generally too large to meaningfully penetrate intact skin.
   Kept as a hydrating ingredient, not claimed as structural collagen
   rebuilding.
9. **"Glowing Skin" formalized as the app's 5th Concern** (`GLOWING_SKIN` in
   the `Concern` enum), structurally different from the other 4 — no
   severity tiers, routine-complexity-based instead.

---

## Section 0 — Prescription-Tier & Regulatory Framework **[NEW]**

Two professional realities shape how this algorithm can safely operate in
Nigeria:

- **Pharmacists** are licensed by the Pharmacy Council of Nigeria (PCN) and
  are legally authorized to dispense prescription-only medicines against a
  valid prescription. This is a real, defined, checkable credential.
- **Medical aestheticians** currently have no equivalent regulatory body in
  Nigeria — oversight of aesthetic medicine is fragmented, with industry
  leaders actively calling for defined role boundaries as of mid-2026.

**Resulting design:** the app has two content tiers, gated on two independent
axes.

- **OTC tier** — available to every subscribed clinic regardless of type.
  Everything in Sections 1–7 below that isn't explicitly marked
  prescription-tier.
- **Prescription tier** — clinically indicated options (Tretinoin,
  Tazarotene, Hydroquinone above 2%, Kojic Acid above 1%, triple/quadruple
  combination creams) always **appear**, to every clinic, labeled with a
  "Prescription only" badge — this is informational, never hidden. Whether
  the item can actually be **dispensed** depends on two things being true at
  once: the `Clinic` must be `licenseType = PHARMACY` with a non-null
  `licenseVerifiedAt` (set manually by a `SUPER_ADMIN` after checking the PCN
  number), **and** the specific logged-in person must be tagged `PHARMACIST`
  (`User.staffType`, set only by their own `CLINIC_ADMIN` — never
  self-declared). A verified-pharmacy clinic with a receptionist or
  technician logged in sees the exact same badge as anyone else — no action.
  **Confirmed directly (this is the domain expert's own field, not a
  legal-research finding on my part):** in Nigeria, none of these ingredients
  are controlled drugs, so a pharmacist's own professional discretion is
  sufficient to dispense — there is no separate legal requirement to record
  a prescription first, the way there would be for an actual controlled
  substance. This gate is Nigeria-specific; revisit before expanding to any
  other country, since the underlying legal distinction (controlled vs.
  merely prescription-only) may not carry over.

Ingredients currently in the prescription tier: **Hydroquinone above 2%**,
**Kojic acid above 1%**, **Tretinoin**, **Tazarotene**, and the
**triple/quadruple combination creams** (Kligman's formula and variants).
Hydroquinone at ≤2% and kojic acid at ≤1% are OTC-tier, same as any other
evidence-based ingredient in this document — subject to the same
pregnancy/breastfeeding/TTC/under-18 hard blocks as everything else with a
real safety concern for those groups. Clascoterone (a topical anti-androgen,
conditionally recommended in the AAD's 2024 acne guidelines) is **not**
currently in the algorithm — availability in Nigeria hasn't been confirmed,
so it's deliberately left out rather than added on an assumption.

---

## Section 1: Acne Vulgaris

### Core Evidence-Based Ingredients

| Ingredient | Concentration | Duration to See Results | Mechanism | Key Notes |
|---|---|---|---|---|
| Benzoyl Peroxide | 2.5%, 5%, or 10% | 4–6 weeks | Kills *Cutibacterium acnes*; reduces inflammation | First-line. 2.5% as effective as 10% with less irritation. Can combine with Adapalene (e.g., Epiduo®) |
| Adapalene | 0.1% or 0.3% gel | 8–12 weeks | Retinoid; normalizes cell turnover; unclogs pores | First-line retinoid, OTC at 0.1% — **appropriate for teens, not prescription-gated** [CORRECTED] |
| Tretinoin | 0.025%, 0.05%, or 0.1% | 8–12 weeks | Retinoid; increases turnover; reduces microcomedones | Prescription only. Start 0.025% every other night |
| Tazarotene | 0.05% or 0.1% | 8–12 weeks | Retinoid; more potent than tretinoin | Prescription only. Severe/resistant acne |
| Trifarotene | 0.005% | 8–12 weeks | Retinoid; selective RAR-gamma | Newest retinoid; facial/truncal acne; better tolerated |
| Salicylic Acid | 0.5–2% | 4–8 weeks | BHA; penetrates pores; dissolves oil/dead skin | Non-inflammatory acne (blackheads/whiteheads) |
| Azelaic Acid | 10% OTC / 15% Rx | 8–12 weeks | Anti-inflammatory; unclogs pores; inhibits melanin | Excellent for acne + PIH combo. Well-tolerated |
| Niacinamide | 2–5% | 4–8 weeks | Anti-inflammatory; regulates sebum; strengthens barrier | 4–5% optimal for acne |
| Glycolic Acid | 5–10% daily / 20–30% peel | 4–8 weeks | AHA; exfoliates; accelerates turnover | Comedonal-component acne |
| Dapsone | 5% gel | 6–8 weeks | Anti-inflammatory | Prescription only |
| Surfactin | Variable (emerging) | Not established | Antibacterial; anti-acne | Preliminary research only |

### Glycolic Acid Chemical Peel Protocol (20–30%)

| Parameter | Recommendation |
|---|---|
| Frequency | Every 1–2 weeks. Never more than once weekly |
| Application | Clean, dry skin; brush/cotton pad; 2–5 min contact (2 min for sensitive skin — **or Fitzpatrick IV–VI, see Section 9**); rinse cool water |
| Duration | 4–6 peels, 1–2 weeks apart |
| Post-Peel Care | Moisturizer immediately after; SPF 30+ daily for ≥1 week after |
| Skin Prep | Stop retinoids/acids 3–5 days before |
| Contraindications | Active cystic acne, active herpes simplex, eczema, dermatitis, pregnancy/breastfeeding |
| Self-Treatment vs Professional | 20–30% ideally professional-administered; 5–10% OK at home |

### Treatment Duration Guidelines

| Acne Severity | Expected Timeline | Action If No Improvement |
|---|---|---|
| Mild | 4–8 weeks | Add a second active |
| Moderate | 8–12 weeks | Prescription-strength retinoid; consider oral antibiotics |
| Severe | 12–16 weeks | Combined therapy; refer to dermatologist for oral isotretinoin |
| Maintenance | Ongoing | Continue actives at reduced frequency |

### When to Combine Actives

| Combination | Evidence | Key Notes |
|---|---|---|
| Adapalene + Benzoyl Peroxide | Strong (Epiduo®) | Adapalene at night, BPO in morning |
| Tretinoin + Benzoyl Peroxide | Strong | Tretinoin at night, BPO in morning |
| Salicylic Acid + Niacinamide | Moderate | SA in cleanser, Niacinamide in serum |
| Azelaic Acid + Niacinamide | Moderate | Good for acne + hyperpigmentation |
| Retinoid + Azelaic Acid | Moderate | Retinoid at night, Azelaic in morning |

### Safety Guardrails — Acne

| Situation | Action |
|---|---|
| Pregnancy/breastfeeding | No retinoids. Azelaic Acid or Benzoyl Peroxide safe |
| Sensitive skin | Lowest concentration; one active at a time |
| No improvement after 8 weeks | Add second active or refer to dermatologist |
| Severe cystic/nodular acne | Refer to dermatologist immediately |
| Irritation, burning, worsening | Stop all actives; gentle cleanser + moisturizer + sunscreen only |

---

## Section 2: Hyperpigmentation (Spots, Melasma, PIH, Sun Damage) **[CORRECTED]**

### Core Evidence-Based Ingredients

| Ingredient | Concentration | Duration | Mechanism | Key Notes |
|---|---|---|---|---|
| **Hydroquinone** | **2% — OTC. Above 2% (incl. 4%): prescription-tier only — see Section 0** | 6–12 weeks | Tyrosinase inhibitor | **[CORRECTED]** 2% is NAFDAC's actual OTC ceiling, confirmed directly by a NAFDAC state coordinator (July 2025) — not a full ban as an earlier version of this document stated. No more than 3–4 months continuous use even at 2%. Still hard-blocked for pregnancy/breastfeeding/TTC and under-18 regardless of concentration |
| Tretinoin | 0.025–0.1% | 6–12 weeks | Increases turnover; enhances penetration | Prescription only |
| Adapalene | 0.1% or 0.3% | 6–12 weeks | Increases turnover | OTC at 0.1% |
| Azelaic Acid | 10% OTC / 15% Rx | 8–12 weeks | Tyrosinase inhibitor; anti-inflammatory | A strong OTC option alongside 2% Hydroquinone — gentler, and the only one of the two that's also safe for the pregnancy/breastfeeding/TTC-excluded population. Excellent for hyperpigmentation + acne |
| Tranexamic Acid | 3–5% topical | 8–16 weeks | Inhibits plasminogen activator | Often combined with Azelaic + Niacinamide. Oral form requires prescription (thrombosis risk) |
| Niacinamide | 4–5% | 4–8 weeks | Inhibits melanosome transfer | Works synergistically with other actives |
| **Kojic Acid** | **1% maximum (OTC)** | 8–12 weeks | Tyrosinase inhibitor | **[CORRECTED]** NAFDAC caps kojic acid at 1% in cosmetic products. Concentrations above 1% are prescription-tier |
| Alpha Arbutin | 1–2% | 8–12 weeks | Tyrosinase inhibitor | Stable, well-tolerated |
| Licorice Root Extract (Glabridin) | 1–10% | 8–12 weeks | Tyrosinase inhibitor; anti-inflammatory | Good for sensitive skin |
| Vitamin C (L-Ascorbic Acid) | 10–20% | 8–12 weeks | Antioxidant; inhibits tyrosinase | Must be ≥10% to be effective; use with Ferulic Acid + Vitamin E |
| 4-Butylresorcinol | 1–3% | 8–12 weeks | Multi-target pathway | Often combined with UPA |
| Undecylenoyl Phenylalanine (UPA) | 1–2% | 8–12 weeks | Multi-target pathway | Often combined with 4-Butylresorcinol |
| Glutathione | 2–5% topical | 8–16 weeks | Antioxidant | |
| Cysteamine | 5% cream | 8–16 weeks | Antioxidant, depigmenting | Alternative to hydroquinone; better tolerated |
| Ferulic Acid | 0.5–1% | 8–12 weeks | Antioxidant; enhances Vitamin C stability | |
| Ellagic Acid | 1% | 8–12 weeks | Depigmenting | Emerging evidence |
| Resveratrol | 1–2% | 8–12 weeks | Antioxidant, depigmenting | Emerging evidence |
| 4MSK | 2–4% | 8–12 weeks | Dual melanocyte activity | Common in Japanese skincare |

### Treatment Duration Guidelines

| Type | Expected Timeline | Action If No Improvement |
|---|---|---|
| Mild (superficial spots) | 4–8 weeks | Continue; consider adding a second OTC active |
| Moderate (PIH) | 8–16 weeks | Combination OTC therapy (e.g. Azelaic + Tranexamic + Niacinamide) |
| Severe (melasma, deep pigmentation) | 16–24 weeks | **Escalation note to verified pharmacy: prescription-tier evaluation** — triple-combination cream with strict breaks, physician-supervised |
| Maintenance | Ongoing | Daily sunscreen; continue 1–2 OTC actives at lower frequency |

### When to Combine Actives

| Combination | Evidence | Key Notes |
|---|---|---|
| **Hydroquinone + Tretinoin** | Strong (Gold Standard) | **Prescription-tier only** — dermatologist/physician prescribed and monitored |
| **Triple-Combination (Hydroquinone + Tretinoin + Fluocinolone Acetonide, e.g. Tri-Luma®)** | Strong | **Prescription-tier only.** Most effective for melasma. Never self-administered, never app-recommended directly |
| Tranexamic Acid + Azelaic Acid + Niacinamide | Moderate | **Best available OTC-tier combination for pigmentation + redness** |
| Vitamin C + Ferulic Acid + Vitamin E | Strong | Apply in the morning |
| Niacinamide + Kojic Acid (≤1%) | Moderate | Mild-to-moderate hyperpigmentation |

### Safety Guardrails — Hyperpigmentation

| Situation | Action |
|---|---|
| Hydroquinone above 2%, or any triple-combination formula | **Route to prescription-tier escalation note; never recommend directly, regardless of clinic type.** 2% itself is a normal OTC option, same handling as any other ingredient in this table |
| Kojic acid above 1% | Same — prescription-tier only |
| Pregnancy/breastfeeding | No hydroquinone, no retinoids. Azelaic Acid and Vitamin C are safe |
| Sensitive skin | Avoid Kojic Acid; use Azelaic Acid, Niacinamide, or Licorice Root Extract |
| No improvement after 12 weeks on OTC tier | Escalation note to verified pharmacy |
| Worsening pigmentation | Stop all actives; confirm SPF 50+ with iron oxides; escalate |

---

## Section 3: Sun Damage & Photoprotection

### Core Evidence-Based Ingredients

| Ingredient | Concentration | Duration | Mechanism | Key Notes |
|---|---|---|---|---|
| Sunscreen (broad-spectrum) | SPF 30–50+ | Immediate; visible benefit 4–8 weeks | Blocks UVB/UVA | Daily; reapply every 2 hours outdoors |
| Tinted Sunscreen | SPF 30–50+ | Same | Blocks UVB, UVA, AND visible light | **Essential for hyperpigmentation** — iron oxides block visible light, which plain sunscreen doesn't |
| Vitamin C | 10–20% | 8–12 weeks | Antioxidant | Morning; with Ferulic Acid + Vitamin E |
| Vitamin E | 0.5–2% | 8–12 weeks | Antioxidant | Combined with Vitamin C |
| Niacinamide | 2–5% | 4–8 weeks | Enhances DNA repair | Morning |
| Photolyase | 1–2% | 4–8 weeks | Repairs UV-induced DNA damage | Emerging |
| Baicalin | 1–2% | 8–12 weeks | Repairs photodamage | Emerging |
| Fenugreek Seed Extract | 1–3% | 8–12 weeks | Antioxidant, UV-absorbing | Emerging |
| Green Tea Extract (EGCG) | 1–5% | 8–12 weeks | Antioxidant, photoprotective | |
| Resveratrol | 1–2% | 8–12 weeks | Antioxidant, photoprotective | |
| Ferulic Acid | 0.5–1% | 8–12 weeks | Antioxidant | Stabilizes Vitamin C |

### Sun Protection Guidelines

| Situation | Recommendation |
|---|---|
| Daily indoor/office | SPF 30+ broad-spectrum |
| Outdoor activity | SPF 50+ water-resistant; reapply every 2 hours |
| Hyperpigmentation (melasma/PIH) | **SPF 50+ tinted with iron oxides — non-negotiable, especially at Fitzpatrick IV–VI (see Section 9)** |
| Acne-prone | Non-comedogenic gel/fluid formulation |
| Sensitive skin | Mineral (Zinc Oxide / Titanium Dioxide) |
| Pregnancy | Mineral only |
| Reapplication | Every 2 hours outdoors; immediately after swimming/sweating |

### Safety Guardrails — Sun Protection

| Situation | Action |
|---|---|
| Hyperpigmentation | Must use tinted sunscreen with iron oxides |
| Retinoid use | Must use daily sunscreen |
| Chemical peel use | Sunscreen for ≥1 week after |
| Sensitive skin | Mineral sunscreen preferred |
| Sunburn | Stop all actives until healed |

---

## Section 4: Ageing Gracefully (Anti-Aging) **[CORRECTED — collagen note]**

### Core Evidence-Based Ingredients

| Ingredient | Concentration | Duration | Mechanism | Key Notes |
|---|---|---|---|---|
| Tretinoin | 0.025–0.1% | 12–24 weeks | Retinoid; stimulates collagen | Gold standard. Prescription only |
| Adapalene | 0.1% or 0.3% | 12–24 weeks | Retinoid | OTC at 0.1% |
| Tazarotene | 0.05% or 0.1% | 12–24 weeks | Retinoid, potent | Prescription only |
| Trifarotene | 0.005% | 12–24 weeks | Selective retinoid | Better tolerated |
| Retinaldehyde (Retinal) | 0.05–0.1% | 12–24 weeks | Retinoid; converts to retinoic acid in a single oxidation step (vs. Retinol's two) | **[NEW]** OTC. Ranked more potent than Retinol at equivalent concentration by dermatologist review (Dr. Elyse Love, board-certified — Skin Wellness Dermatology: "retinaldehyde is the most potent [OTC retinoid], but most difficult to stabilize"). Creidi et al. 1998: 0.05% retinaldehyde outperformed 0.05% retinol on fine lines/texture/pigmentation over 18 weeks. Saurat et al. 1994: 0.05% retinaldehyde produced epidermal/collagen changes comparable to prescription retinoic acid, with markedly better tolerability |
| Retinol | 0.1–1.0% | 12–24 weeks | Retinoid; requires two enzymatic conversion steps to reach retinoic acid | **[NEW]** OTC, the most widely available and studied of the true retinoids. Kafi et al. 2007: 0.4% significantly improved fine wrinkles and procollagen expression over 24 weeks. Weaker than Retinaldehyde per the conversion-step distance from active retinoic acid, but well-evidenced on its own |
| Bakuchiol | 0.5–2% | 12–16 weeks | Retinol-like, comparable efficacy | Natural alternative, well-tolerated. Not a true retinoid — sits below Retinaldehyde/Retinol/Retinyl esters in potency, positioned here as the gentlest option in this family, per the dermatologist-reviewed hierarchy above |
| Hydroxypinacolone Retinoate | 0.1–0.5% | 12–16 weeks | Next-gen retinoid ester | Better tolerated than tretinoin |
| Retinyl Retinoate | 0.1–0.5% | 12–16 weeks | Next-gen retinoid ester | Better tolerated |
| Vitamin C | 10–20% | 12–24 weeks | Cofactor in collagen synthesis | Morning |
| Peptides (Matrixyl, Argireline) | 2–10% | 12–24 weeks | Stimulate collagen; reduce expression lines | Adjunctive therapy |
| Coenzyme Q10 | 0.5–1% | 12–24 weeks | Antioxidant; mitochondrial support | |
| Hyaluronic Acid | 0.1–2% | 4–8 weeks | Hydration, plumpness | Serum form |
| Ceramides | 1–3% | 4–8 weeks | Barrier strength | Moisturizer |
| EGCG | 1–5% | 12–24 weeks | Antioxidant, anti-photoaging | |
| Curcumin | 1–2% topical / 500mg oral | 12–24 weeks | Antioxidant, anti-inflammatory | |
| Rutin | 1–2% | 12–24 weeks | Attenuates oxidative stress | Emerging |
| Resveratrol | 1–2% | 12–24 weeks | Antioxidant | Emerging |
| Collagen | 1–5% topical / 2.5–15g oral | 12–24 weeks | *(see note below)* | **[CORRECTED]** Topical collagen's molecule is generally too large to meaningfully penetrate intact skin — treat as a hydrating/marketing-supported ingredient, not a structural collagen-rebuilding claim. Oral collagen peptides have somewhat more supporting evidence for elasticity/hydration |
| THD Ascorbate | 2–5% | 12–24 weeks | Stable Vitamin C derivative | Less irritating than L-Ascorbic Acid |

### Treatment Duration Guidelines

| Concern | Expected Timeline | Action If No Improvement |
|---|---|---|
| Fine lines | 12–24 weeks | Increase retinoid concentration or add second active |
| Deep wrinkles | 24–48 weeks | Prescription-strength retinoid; refer for injectables/laser |
| Loss of firmness | 24–48 weeks | Add peptides or collagen supplementation |
| Maintenance | Ongoing | Reduced-frequency actives |

### When to Combine Actives

| Combination | Evidence | Key Notes |
|---|---|---|
| Retinoid + Vitamin C | Strong | Vitamin C morning, Retinoid night |
| Retinoid + Peptides | Moderate | Retinoid night, Peptides morning |
| Vitamin C + Vitamin E + Ferulic Acid | Strong | Morning antioxidant protection |
| Hyaluronic Acid + Ceramides | Strong | HA in serum, Ceramides in moisturizer |

### Safety Guardrails — Anti-Aging

| Situation | Action |
|---|---|
| Pregnancy/breastfeeding | No retinoids. Use Bakuchiol, Vitamin C, Hyaluronic Acid, Peptides |
| Sensitive skin | Bakuchiol instead of retinoids; lowest concentrations |
| Irritation/worsening | Stop all actives; gentle routine only |
| Retinoid introduction | Lowest concentration, every other night for 2 weeks, then nightly if tolerated |

---

## Section 5: Glowing Skin (General Skin Health & Radiance)

Now formalized as `GLOWING_SKIN`, the app's 5th Concern — structurally
different from Sections 1–4: no severity tiers, routine-complexity based
instead (see Assessment Questionnaire Part 5E).

**The Six Steps:** Clean, Nourish, Moisturise, Protect, Pamper, Treat.

### Core Evidence-Based Ingredients

| Ingredient | Concentration | Duration | Mechanism | Key Notes |
|---|---|---|---|---|
| Niacinamide | 2–5% | 4–8 weeks | Barrier support; hydration; sebum regulation | Multi-functional "hero" ingredient |
| Ceramides | 1–3% | 4–8 weeks | Barrier strength | Moisturizer |
| Hyaluronic Acid | 0.1–2% | 4–8 weeks | Hydration | Attracts 1000x its weight in water |
| Vitamin C | 10–20% | 8–12 weeks | Collagen cofactor; antioxidant | Morning |
| THD Ascorbate | 2–5% | 8–12 weeks | Stable Vitamin C derivative | |
| Collagen | 1–5% topical | 12–24 weeks | *(see Section 4 note on topical collagen)* | |
| Vitamin A / Retinoid Derivatives | Variable | 8–12 weeks | Cell turnover | See Sections 1/4 for specific retinoids |
| Zinc | 0.1–0.5% topical | 8–12 weeks | Skin health support | |
| Marigold Extract (Calendula) | 1–3% | 8–12 weeks | Brightening | Emerging |
| Exosomes | Variable | 8–12 weeks | Cellular regeneration | Emerging, typically in-office/injectable adjunct, not a standard at-home step |
| PDRN | Variable | 8–12 weeks | Cellular regeneration | Emerging, same caveat as Exosomes |
| Fruit Residue Bioactives | 1–5% | 8–12 weeks | Flavonoids, polyphenols | Emerging |
| Glycerin | 1–5% | 2–4 weeks | Humectant | Common in moisturizers |
| Panthenol (B5) | 1–5% | 2–4 weeks | Humectant, soothing | |
| Allantoin | 0.5–2% | 2–4 weeks | Soothing, healing | |

### Daily Routine Structure

| Time | Step | Key Ingredients |
|---|---|---|
| Morning | Cleanse | Gentle cleanser, Glycerin, Panthenol |
| | Nourish | Vitamin C Serum (10–20%) + Ferulic Acid + Vitamin E |
| | Moisturise | Hyaluronic Acid + Ceramides + Niacinamide |
| | Protect | Sunscreen SPF 30–50+, tinted if hyperpigmentation |
| Evening | Cleanse | Gentle cleanser |
| | Treat | Concern-specific active (Retinoid / Azelaic Acid / Salicylic Acid — depending on selected concern) |
| | Moisturise | Hyaluronic Acid + Ceramides + Niacinamide |
| | Pamper | Night cream/mask — Hyaluronic Acid + Peptides + Ceramides |

### Lifestyle Factors

| Factor | Recommendation |
|---|---|
| Water | 2–3 litres daily |
| Diet | Fruits, vegetables, whole grains, nuts, seeds |
| Sleep | 7–9 hours |
| Exercise | Regular moderate exercise |
| Stress | Meditation, yoga, deep breathing |
| Smoking | Avoid — accelerates ageing |
| Alcohol | Limit — dehydrates skin |

---

## Section 6: Ageing Gracefully — Brand Framing

Ageing is framed as a natural, beautiful process — "growing old in style,
growing old gracefully" — with Retinoids as the gold-standard active
supporting the "Pamper" step of the six-step routine, alongside Vitamin C
and daily sunscreen. This framing sits well alongside the current cultural
moment in Nigerian dermatology (see Section 9) — a push toward pride in
natural skin tones and away from lightening-adjacent messaging.

---

## Section 7: Age & Hormonal Stage Considerations **[CORRECTED]**

### Overview — Why This Matters

| Life Stage | Key Hormonal Changes | Impact on Skin | Recommended Adjustments |
|---|---|---|---|
| Puberty (~10–18) | Androgen surge → increased sebum | Acne, oily skin, blackheads | Gentle cleansing; Salicylic Acid; Benzoyl Peroxide; **Adapalene 0.1% is appropriate OTC first-line, not prescription-gated [CORRECTED]** |
| Reproductive Years | Estrogen/progesterone fluctuations | Acne flares, melasma, sensitivity | Hormonal-pattern-aware acne treatment; monitor pregnancy status |
| Pregnancy (any age) | Estrogen, progesterone, MSH | Melasma, hyperpigmentation, sensitivity | **Strict safety protocol** — see below |
| Breastfeeding | Prolactin, estrogen fluctuations | Melasma may persist; drier or oilier skin | Continue pregnancy-safe protocol |
| Perimenopause | Estrogen decline, progesterone fluctuations | Dryness, loss of firmness, acne may return, melasma | Hydration, barrier repair, gentle anti-aging |
| Menopause | Estrogen drop, androgen dominance | Thinning skin, dryness, wrinkles, adult acne | Barrier support, collagen stimulation, moisturization |
| Post-Menopause | Low estrogen, low androgens | Very dry, fragile skin; slower wound healing | Barrier repair, gentle exfoliation, hydration |

**[CORRECTED] — On age bands:** the ranges above are context, not the
source of truth. Life stage is determined by the direct question
(Assessment Questionnaire Part 1.4: "Have you gone through menopause?"),
because age alone produces contradictions — a 47-year-old could be
perimenopausal, menopausal, or still fully reproductive, and only she knows
which.

### Age-Based Adjustments — Acne

| Life Stage | Key Considerations | Recommended Actives | Avoid |
|---|---|---|---|
| Puberty | Oily skin, blackheads, hormonal surges | Salicylic Acid (0.5–2%), Benzoyl Peroxide (2.5–5%), **Adapalene (0.1%, standard OTC first-line)** | High-strength prescription retinoids, oral isotretinoin, aggressive peels |
| Reproductive Years | Hormonal/cycle-related flares (jawline, chin) | Azelaic Acid (10–15%), Salicylic Acid, Benzoyl Peroxide, Adapalene/Tretinoin if not pregnant | — |
| Pregnancy | May improve or worsen; more sensitive | Azelaic Acid (10–15%) — safe; Benzoyl Peroxide (2.5–5%) — safe | Retinoids, salicylic acid >2%, oral medications without OB-GYN approval |
| Breastfeeding | May persist; sensitivity | Azelaic Acid, Benzoyl Peroxide | Retinoids, hydroquinone |
| Perimenopause | May return | Azelaic Acid, Niacinamide, Retinoids if no pregnancy concerns | Aggressive exfoliation |
| Menopause | Adult acne (androgen dominance) | Azelaic Acid, Niacinamide, Retinoids (start slow) | Harsh cleansers |
| Post-Menopause | Less common, still possible | Azelaic Acid, low-concentration Retinoids | Aggressive exfoliation |

### Age-Based Adjustments — Hyperpigmentation

| Life Stage | Key Considerations | Recommended Actives | Avoid |
|---|---|---|---|
| Puberty | PIH from acne | Azelaic Acid, Alpha Arbutin, Niacinamide | Hydroquinone at any concentration (not appropriate for minors — unrelated to the OTC/Rx line, an absolute exclusion for this age group) |
| Reproductive Years | Melasma, PIH, sun damage | Azelaic Acid, Hydroquinone 2% (OTC), Tranexamic Acid, Vitamin C; **above 2% → escalation note only** | — |
| Pregnancy | Melasma very common | Azelaic Acid, Vitamin C, Niacinamide — safe | Hydroquinone, retinoids, high-strength peels, oral tranexamic acid |
| Breastfeeding | Melasma may persist | Azelaic Acid, Vitamin C, Niacinamide, Alpha Arbutin | Hydroquinone, retinoids |
| Perimenopause | May worsen; skin drier | Tranexamic Acid, Hydroquinone 2%, Vitamin C, Retinoids if not pregnant; **above 2% → escalation note only** | Aggressive peels |
| Menopause | May worsen | Tranexamic Acid, Hydroquinone 2%, Vitamin C, Retinoids; **above 2% → escalation note only** | Aggressive exfoliation |
| Post-Menopause | Stubborn; skin fragile | Vitamin C, Niacinamide, Hydroquinone 2% short-term, low-concentration Retinoids; **above 2% → escalation note only** | Aggressive peels |

### Hormonal Shifts & Skincare

**Pregnancy & Breastfeeding — the most critical safety section.**

| Factor | Impact | Action |
|---|---|---|
| SAFE ingredients | — | Azelaic Acid (10–15%), Vitamin C (10–20%), Niacinamide, Hyaluronic Acid, Ceramides, Glycerin, Panthenol, Mineral Sunscreen |
| AVOID completely | — | Retinoids (teratogenic), Hydroquinone, high-dose Salicylic Acid (>2%), Chemical Peels, Oral Tranexamic Acid (thrombosis risk), Oral Isotretinoin (absolute contraindication) |
| Sun Protection | Melasma worsens with sun exposure | Tinted sunscreen with iron oxides — critical |
| Referral | Severe melasma or acne | Refer to dermatologist or OB-GYN |

**Perimenopause / Menopause / Post-Menopause** — see the age-based tables
above; the general pattern across all three is hydration and barrier repair
first, retinoids introduced slowly, aggressive exfoliation avoided.

### Assessment Questions Capturing Age & Hormonal Stage

See **Assessment Questionnaire, Part 1** for the finalized question wording
and answer options — Age & Life Stage (1.1), Pregnancy/Breastfeeding/TTC
(1.3), Menopause status (1.4), Contraception/HRT (1.5), Cycle/hot flashes
(1.6).

### Hard Safety Rules (Blocking Rules) **[CORRECTED — TTC extended]**

| Condition | Blocked | Reason |
|---|---|---|
| Pregnant or breastfeeding | Retinoids, Hydroquinone, high-dose Salicylic Acid (>2%), Chemical peels, Oral Tranexamic Acid | Teratogenic risk; insufficient safety data; thrombosis risk |
| Trying to conceive | **Retinoids, Hydroquinone, Oral Tranexamic Acid [CORRECTED — originally retinoids only]** | Pregnancy can predate a positive test — same caution as confirmed pregnancy for these three |
| Under 18 | Hydroquinone (also prescription-tier regardless), Tretinoin/Tazarotene/Trifarotene above minimal strength | Not appropriate for minors. Adapalene 0.1% remains available |
| Severe cystic/nodular acne | Continued OTC-only treatment | Must refer to dermatologist |
| No improvement after 8–12 weeks | Continued self-treatment at the same tier | Must refer/escalate |

### Personalization Rules

| Variable | Adjustment |
|---|---|
| Age 18–25 | Higher sebum → oil control, acne management focus |
| Age 26–35 | Collagen decline begins → add Vitamin C, consider anti-aging |
| Age 36–45 | Estrogen decline starting → hyaluronic acid, ceramides, barrier support |
| Age 46–55 | Menopause likely → retinoids start slow, peptides, deep moisturization |
| Age 55+ | Fragile skin → lowest retinoid concentration, barrier repair focus, avoid aggressive exfoliation |
| Hormonal (cycle-related) acne | Add Azelaic Acid or Niacinamide; spironolactone → refer to dermatologist. **Now actually wired**: the assessment's cycle follow-up question feeds this directly into `matching-engine.ts`'s scoring — this was previously documented intent only |
| Melasma (hormonal) | Tranexamic Acid + Azelaic Acid + Vitamin C; mandatory tinted sunscreen |

### Example Algorithm Outputs

**Example 1 — 16-year-old, oily skin, acne (blackheads/whiteheads):**
Cleanse: Gentle foaming cleanser with Salicylic Acid (0.5–2%) · Treat:
Benzoyl Peroxide (2.5–5%) OR Adapalene (0.1%) · Moisturise: Non-comedogenic,
Niacinamide · Protect: Oil-free SPF 30+ · Safety flag: under 18, hydroquinone
excluded.

**Example 2 — 32-year-old, pregnant, melasma:**
Cleanse: Gentle (Glycerin, Panthenol) · Treat: Azelaic Acid (10–15%) — safe
· Nourish: Vitamin C (10–20%) — safe · Moisturise: Hyaluronic Acid +
Ceramides · Protect: Tinted SPF 50+ with iron oxides — critical · Safety
flag: hard block on retinoids, hydroquinone, chemical peels · Referral if no
improvement in 12 weeks.

**Example 3 — 52-year-old, menopausal, wrinkles & dryness:**
Cleanse: Milky, no SLS · Treat: Retinol 0.025%, start every other night ·
Nourish: Vitamin C morning · Moisturise: Hyaluronic Acid + Ceramides +
Peptides · Protect: SPF 30+ · Pamper: Night cream with Retinoid + Ceramides
· Safety flag: slow retinoid start, barrier-repair focus.

---

## Section 8: Combination-Concern Rules **[NEW]**

Real patients rarely select exactly one concern. The most common overlaps
need dedicated rules rather than trusting two single-concern rules to
compose safely:

| Combination | Approach |
|---|---|
| Acne + Hyperpigmentation | Azelaic Acid as the anchor active — it's the one ingredient across the whole protocol explicitly effective for both simultaneously. Avoid stacking two separate retinoid-based routines |
| Acne + Aging | Adapalene/Tretinoin already serves both — one retinoid routine, not two |
| Hyperpigmentation + Sun Damage | Tinted sunscreen with iron oxides becomes non-negotiable, not just recommended; Vitamin C serves both |
| Aging + Sun Damage | Vitamin C + Vitamin E + Ferulic Acid morning antioxidant stack serves both |
| Any concern + Glowing Skin | Glowing Skin's six-step structure becomes the routine scaffold; the other concern's specific "Treat" step slots into it, rather than running two parallel routines |

**Implementation status:** the first 4 combinations above are built as real
`SkincareRule` rows with multi-concern `condition.concerns` arrays (e.g.
`["ACNE","HYPERPIGMENTATION"]`) in `prisma/rules-data.ts`, scored above two
separate single-concern rules whenever both apply. The 5th — "Any concern +
Glowing Skin" — was deliberately not built as a forced pairing; letting the
more clinically specific concern win on its own already works fine, and
forcing every concern to have its own Glowing Skin variant would have
meant real duplication for limited benefit.

---

## Section 9: Fitzpatrick / Skin-of-Color Considerations **[NEW]**

Since this app serves a patient base that is predominantly Fitzpatrick
IV–VI, several defaults shift compared to a protocol written without that
in mind:

- **Post-inflammatory hyperpigmentation risk is meaningfully higher** in
  darker skin — anything irritating (peels, aggressive retinoid
  introduction, harsh exfoliation) carries more downside than the same
  irritation would in lighter skin.
- **Chemical peel strength and contact time should default toward the
  gentler end** of the ranges in Section 1 for Fitzpatrick IV–VI, not the
  midpoint.
- **Retinoid/AHA introduction should default to a slower build-up
  schedule.**
- **Tinted sunscreen with iron oxides is not optional for hyperpigmentation
  in this population** — plain sunscreen doesn't block the visible light
  that disproportionately drives melasma/PIH in darker skin.
- **Azelaic Acid, Niacinamide, and Licorice Root Extract are preferred
  first-line actives** over harsher options, consistent with skin-of-color
  dermatology guidance generally.

See Assessment Questionnaire Part 3 for the Fitzpatrick self-assessment
questions and scoring.

---

## Complete Summary Table

| Condition | Core Ingredients | Additional Evidence-Based Ingredients | Regulatory Note |
|---|---|---|---|
| Acne | Benzoyl Peroxide, Adapalene, Salicylic Acid, Azelaic Acid | Niacinamide, Dapsone, Glycolic Acid, Tazarotene, Trifarotene | None |
| Hyperpigmentation | Azelaic Acid, Hydroquinone (≤2%), Vitamin C, Niacinamide, Alpha Arbutin, Licorice Root | Tranexamic Acid, 4-Butylresorcinol, UPA, Glutathione, Cysteamine, Ferulic Acid | **Hydroquinone >2% & Kojic Acid >1%: prescription-tier only** |
| Sun Damage | Sunscreen (SPF 30+), Vitamin C | Photolyase, Vitamin E, Niacinamide, Baicalin, Fenugreek, Green Tea, Resveratrol | None |
| Ageing Gracefully | Retinoids, Vitamin C | Peptides, CoQ10, Bakuchiol, EGCG, Curcumin, Hyaluronic Acid, Ceramides | None |
| Glowing Skin | Clean/Nourish/Moisturise/Protect/Pamper/Treat framework | Ceramides, Niacinamide, Hyaluronic Acid, Collagen, Zinc, Glycerin, Panthenol | None |

---

## Ready for If-Then Decision Trees — Confirmed Coverage

1. Exact ingredient names and concentrations ✓
2. Duration to see results per condition ✓
3. Safe active combinations ✓
4. Safety guardrails, contraindications, referral timelines ✓
5. Retinoid/acid tolerance-building protocols ✓
6. Barrier protection recommendations ✓
7. Visible-light protection for hyperpigmentation ✓
8. Pregnancy/breastfeeding safety ✓ — **extended to Trying to Conceive**
9. Glycolic acid peel protocol ✓ — **Fitzpatrick-aware contact time**
10. Referral guidance for prescription-tier content ✓ — **now enforced by clinic verification, not just written guidance**
11. Peptides confirmed as adjunctive anti-aging therapy ✓
12. Ageing gracefully brand framing ✓
13. Age/hormonal-stage personalization ✓ — **age bands clarified as fallback, direct question as source of truth**
14. **[NEW]** Combination-concern rules — 4 of 5 built into rule data (see Section 8 for which one wasn't, and why)
15. **[NEW]** Fitzpatrick/skin-of-color defaults
16. **[NEW]** NAFDAC-compliant hydroquinone/kojic acid handling

**Done:** the actual `SkincareRule` rows implementing all of the above exist
in `prisma/rules-data.ts` — 20 rules total, including the 4 combination
rules from Section 8. `scripts/generate-seed-sql.ts` turns this into
pasteable SQL for Neon (`seed-rules.sql`) — regenerate that file any time
`rules-data.ts` changes, and re-run it in Neon's SQL Editor.
