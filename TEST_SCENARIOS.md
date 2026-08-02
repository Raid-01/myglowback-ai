# MyGlowBack.AI — Assessment & Algorithm Test Plan

**How to use this:** for each scenario, run a real assessment through the
form with the listed answers, then check the result against "What should
happen." Priority 1 scenarios are the safety-critical ones — test these
before anything else. Priority 2 rounds out completeness once Priority 1 is
solid.

---

## Priority 1 — Safety-Critical (test these first)

These prove the hard-block logic actually blocks things, not just that it
exists in the code.

| # | Patient archetype | Key answers to enter | What should happen |
|---|---|---|---|
| 1 | Pregnant, acne | Sex: Female · Pregnancy: Pregnant · Concern: Acne (any severity) | Routine uses **Azelaic Acid + Benzoyl Peroxide only** — Adapalene must NOT appear anywhere in the result, regardless of severity answers given |
| 2 | Trying to conceive, aging | Sex: Female · Pregnancy: Trying to conceive · Concern: Aging | Routine uses **Bakuchiol**, not Retinaldehyde/Retinol — this is the extended TTC block in action |
| 3 | Breastfeeding, hyperpigmentation | Sex: Female · Pregnancy: Breastfeeding · Concern: Hyperpigmentation, Severe | Should still get the normal Severe hyperpigmentation routine (Tranexamic + Azelaic) — this concern's rules never contained hydroquinone/retinoids to begin with, so nothing should be blocked or missing here. **If the routine comes back empty or generic-fallback, that's a bug** |
| 4 | Under 18, acne | Age: Under 18 · Concern: Acne, Severe | Should get the normal Severe acne routine (Benzoyl Peroxide + **Adapalene 0.1% is fine for minors**) — confirm Adapalene isn't wrongly blocked |
| 5 | Male patient | Sex: Male | Confirm the pregnancy/menopause/hormonal questions **never appear on screen at all** — not hidden-but-present, actually absent from the flow |
| 6 | "Prefer not to say" | Sex: Prefer not to say | Confirm pregnancy questions **do** appear (this branch should behave like Female, not like Male) |

---

## Priority 1 — Pharmacy Verification Gate

| # | Scenario | Setup | What should happen |
|---|---|---|---|
| 7 | Unverified clinic, severe pigmentation | Use a clinic that has never been through Super Admin verification · Concern: Hyperpigmentation, Severe | Should get the plain "Hyperpigmentation — Severe" rule. Escalation note should be **generic** ("may benefit from prescription-strength intervention") — must NOT mention hydroquinone or Kligman's by name |
| 8 | Clinic claims Pharmacy but isn't verified yet | Set `licenseType = PHARMACY` on a clinic but leave `licenseVerifiedAt` null · same test as #7 | Must behave **identically to #7** — self-declaring pharmacy status must not unlock anything on its own |
| 9 | Verified pharmacy | Super Admin sets `licenseType = PHARMACY` and `licenseVerifiedAt` to a real timestamp on a clinic · same test as #7 | Should now get "Hyperpigmentation — Severe (Pharmacy-Verified)" — escalation note **does** name hydroquinone/Kligman's specifically, framed as "requires a prescription," never as a direct instruction |

---

## Priority 2 — Severity Tier Coverage

Confirms each concern's Mild/Moderate/Severe branch actually pulls the
right rule, not just that severity is being calculated.

| # | Concern | Answers to trigger this tier | Expected rule |
|---|---|---|---|
| 10 | Acne | 0–5 breakouts, no cysts, not chronic | Acne — Mild |
| 11 | Acne | 6–15 breakouts, a few cysts | Acne — Moderate |
| 12 | Acne | 15+ breakouts, several cysts, chronic 3+ months | Acne — Severe (with dermatologist-referral escalation note) |
| 13 | Hyperpigmentation | Barely noticeable, under 3 months | Hyperpigmentation — Mild |
| 14 | Hyperpigmentation | A shade or two darker, 3–12 months | Hyperpigmentation — Moderate |
| 15 | Hyperpigmentation | Several shades darker, over a year | Hyperpigmentation — Severe |
| 16 | Sun Damage | Daily SPF + reapply, 0 visible signs | Sun Damage — Mild |
| 17 | Sun Damage | Never wears SPF, 3+ visible signs | Sun Damage — Severe |
| 18 | Aging | Fine lines only | Aging — Mild |
| 19 | Aging | Loss of firmness/sagging | Aging — Severe |

---

## Priority 2 — Objective Skin Type Determination

Confirms the computed skin type actually matches the decision table, not
just that *a* skin type comes back.

| # | T-zone answer | Cheeks answer | Pores answer | Expected result |
|---|---|---|---|---|
| 20 | Shiny/oily | Shiny/oily | Visible, most of face | OILY |
| 21 | Tight/dry | Tight/dry | Barely visible | DRY |
| 22 | Comfortable | Comfortable | Barely visible | NORMAL |
| 23 | Shiny/oily | Tight/dry | Visible mainly T-zone | COMBINATION (the classic pattern — most important one to verify) |
| 24 | Any of the above | — | — | Additionally answer "frequently" to reactivity + "yes" to doctor-diagnosed reactive condition → confirm `sensitiveOverlay` is flagged **independently** of whatever base type came back (e.g. test this on top of an OILY result, not just a DRY one — sensitivity shouldn't only work for dry skin) |

---

## Priority 2 — Fitzpatrick Range

| # | Natural tone answer | Sun reaction answer | Expected type |
|---|---|---|---|
| 25 | Very pale/ivory | Always burns, never tans | Type I |
| 26 | Deeply pigmented, dark brown to black | Never burns, always deeply pigments | Type VI |
| 27 | Medium/tan-brown | Rarely burns, tans well | Type IV (mid-range — this is where most real patients will likely land, worth extra attention) |

---

## Priority 2 — Combination Rules

The most important thing to verify here: when two concerns are selected,
the result should be **one coherent combined routine**, not the routine for
whichever concern happened to score slightly higher with the second one
silently dropped.

| # | Concerns selected | Expected rule | What to check specifically |
|---|---|---|---|
| 28 | Acne + Hyperpigmentation | Combination — Acne + Hyperpigmentation | Azelaic Acid should be the anchor active — confirm it's NOT just the plain Acne-tier rule with hyperpigmentation quietly missing |
| 29 | Acne + Aging | Combination — Acne + Aging | Single Adapalene-based routine, not two competing retinoid steps |
| 30 | Hyperpigmentation + Sun Damage | Combination — Hyperpigmentation + Sun Damage | Tinted sunscreen should be explicitly called out as non-negotiable |
| 31 | Aging + Sun Damage | Combination — Aging + Sun Damage | Antioxidant stack (Vitamin C/E/Ferulic) should be prominent |
| 32 | All 5 concerns at once | *(stress test — no specific expected rule)* | Confirm the app doesn't crash or return an empty result. Whatever rule wins, it should still be a real, complete routine |

---

## Priority 2 — Glowing Skin & Fallback

| # | Scenario | What should happen |
|---|---|---|
| 33 | Only "Glowing Skin" selected | Six-step routine (Clean/Nourish/Moisturise/Protect/Pamper/Treat) — no severity questions should appear for this concern at all |
| 34 | Allergy conflict | Select Acne or Hyperpigmentation, then list "azelaic acid" under allergies | The engine should skip any rule containing azelaic acid and fall back to the next-best valid rule — confirm the result never actually contains azelaic acid, and isn't just the empty generic fallback if a valid alternative rule exists |
| 35 | Genuinely no rule fits | *(harder to trigger deliberately — worth trying a severity/concern combo you don't expect coverage for)* | Should return the safe generic fallback (gentle cleanser, fragrance-free moisturizer, mineral SPF) rather than erroring, with `matchedRuleNames` showing "No rule matched — flagged for pharmacist review" |

---

## Priority 2 — Products & Upsells

| # | Check | What should happen |
|---|---|---|
| 36 | Run any assessment against the seeded demo clinic (GlowHaus) | In-stock products tagged with a matching concern should appear as matched products; products marked `isUpsell: true` should appear separately in the upsells list, not mixed into the main recommendation |

---

## After testing: what a failure actually means

- **A Priority 1 failure is a stop-everything bug** — it means an unsafe
  ingredient could reach a real patient, or the pharmacy gate can be
  bypassed. Screenshot it exactly like the Render/Neon debugging earlier in
  this project and it'll get fixed before anything else.
- **A Priority 2 failure** usually means a rule's `condition` tags need
  adjusting, not that the underlying safety logic is broken — still worth
  flagging, just less urgent.
