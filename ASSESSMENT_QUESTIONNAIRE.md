# MyGlowBack.AI — Patient Assessment Questionnaire & Severity-Scoring Rubric

**Status: content finalized and fully built into the UI.** `AssessmentForm.tsx`
is a complete multi-step wizard covering every question below — see
`src/components/assessment-steps/` for each step as its own file, and
`src/lib/assessment-scoring.ts` for the derivation/severity math. Every
question below already has a matching field in the database schema
(`prisma/schema.prisma`) and the matching engine (`src/lib/matching-engine.ts`).

**Design principle throughout:** nothing here is decorative. Every question
either (a) feeds a hard safety rule, (b) determines a severity tier, (c)
determines skin type/Fitzpatrick objectively rather than by self-label, or
(d) selects/personalizes the routine. Part 7 is the literal mapping table
proving that. If a question doesn't earn its place on that table, it
shouldn't be in the form.

---

## Part 1 — Universal Safety & Demographic Screen

Asked to every patient, before anything about their skin concerns. This part
exists to populate the **hard safety blocks** — the app must never reach the
concern questions with these unanswered, because the blocking logic runs
before any routine is even considered.

| # | Question | Options | Why it matters | Schema field |
|---|---|---|---|---|
| 1.1 | What is the patient's age range? | Under 18 / 18–25 / 26–35 / 36–45 / 46–55 / 55+ | Retinoid/hydroquinone ceilings, exfoliation intensity, collagen-decline tier | `Assessment.ageRange` |
| 1.2 | Sex assigned at birth? | Female / Male / Intersex or other / Prefer not to say | Purely to decide whether 1.3–1.6 are shown at all — never used to gate care itself | `Patient.biologicalSex` |
| 1.3 | *(shown only if 1.2 = Female or "prefer not to say")* Are you currently pregnant, breastfeeding, or trying to conceive? | Pregnant / Breastfeeding / Trying to conceive / None of these / Prefer not to say | **HARD SAFETY FLAG.** Drives the retinoid / hydroquinone / high-dose salicylic acid / chemical peel / oral tranexamic acid blocks | `Assessment.pregnancyStatus` |
| 1.4 | *(shown only if 1.2 = Female or "prefer not to say", and 1.3 ≠ Pregnant/Breastfeeding)* Have you gone through menopause? | Not yet / Perimenopausal (periods becoming irregular) / Yes, menopausal / Not applicable | Direct question is the source of truth — **not** inferred from age alone, since age bands overlap in real life | `Assessment.hormonalStage` |
| 1.5 | Are you currently on hormonal birth control or hormone replacement therapy (HRT)? | Yes / No | Contextual signal for acne/melasma patterns; informational for now, not a hard block | `Assessment.onHormonalContraceptionOrHRT` |
| 1.6 | Does your skin noticeably change around your menstrual cycle, or do you get hot flashes/night sweats? | Cycle-related flares / Hot flashes or night sweats / Both / Neither | Confirms suspected hormonal stage even if 1.4 was skipped or uncertain | `Assessment.cycleRelatedFlares`, `Assessment.hotFlashesOrNightSweats` |
| 1.6a | *(shown only if 1.6 = cycle-related flares)* How does it change? | More breakouts/oilier · More sensitive or irritated · Drier *(select all that apply)* | **[NEW]** "More breakouts/oilier" + Acne selected → biases the matching engine toward Azelaic Acid/Niacinamide-anchored rules, per the Personalization Rules table in `MASTER_ALGORITHM.md` Section 7 | `Assessment.cyclePattern` |
| 1.6b | Noticed any recent change in your skin's texture (drier, more sensitive)? *(this question existed in the code before this document was updated to include it — flagging that gap now, not introducing something new)* | Yes / No | If Yes, triggers 1.6c below | `Assessment.recentSkinTextureChange` |
| 1.6c | *(shown only if 1.6b = Yes)* What changed? | Drier · More sensitive or reactive *(select all that apply)* | **[NEW]** "Drier" biases toward barrier-repair framing. "More sensitive" feeds `sensitiveOverlay` directly, on equal footing with 2.4/2.5 — a newly-reactive patient gets the gentler tier regardless of which question caught it | `Assessment.textureChangeType` |
| 1.7 | Any known allergies or reactions to skincare ingredients? | Free text (prompt with common examples: fragrance, sulfates, a specific active) | Disqualifies any rule that would recommend a conflicting ingredient | `Assessment.allergies` |
| 1.8 | Any skin conditions a doctor has diagnosed you with (eczema, rosacea, psoriasis, dermatitis, etc.)? | Free text | Pushes toward gentler actives regardless of what the concern questions alone would suggest | `Assessment.knownSkinConditions` |
| 1.9 | Are you currently using any prescription skincare, oral acne/skin medication, or supplements for your skin? | Free text | Avoids recommending something redundant or conflicting; signals if patient is already under a doctor's care | `Assessment.currentMedications` |
| 1.10 | Have you tried treating this before? What, and did it help? | Free text | Avoids re-recommending something already tried and failed; signals whether to start conservative or escalate immediately | `Assessment.previousTreatments` |

**Branching rule:** 1.3–1.4 only appear for patients who selected Female or
"prefer not to say" at 1.2 — never shown to a patient who selected Male, and
never assumed for anyone. If skipped, the fields default to `NOT_APPLICABLE`,
which the matching engine treats as "no restriction applies" — the same as
if the patient had answered "none of these."

---

## Part 2 — Objective Skin Type (not a self-label)

This is the piece Sade specifically flagged: skin type must be **derived**
from how the skin actually behaves, not from a patient guessing "I think I'm
combination." Two behavior questions determine the base type; a third
resolves ambiguous cases.

| # | Question | Options |
|---|---|---|
| 2.1 | A few hours after washing with a gentle cleanser, with **no** product applied since, how does your **T-zone** (forehead, nose, chin) feel? | Tight/dry (D) · Comfortable (N) · Shiny/oily (O) |
| 2.2 | In that same window, how do your **cheeks** feel? | Tight/dry (D) · Comfortable (N) · Shiny/oily (O) |
| 2.3 | How visible are your pores overall? | Barely visible · Visible mainly in the T-zone · Visible and enlarged across most of the face |

**Scoring — decision table (2.1, 2.2) → base skin type:**

| T-zone \ Cheeks | Dry | Normal | Oily |
|---|---|---|---|
| **Dry** | DRY | DRY | COMBINATION *(rare pattern — confirm with 2.3)* |
| **Normal** | DRY | NORMAL | COMBINATION |
| **Oily** | COMBINATION | COMBINATION | OILY |

**Tie-breaker (2.3):** if the table above lands on a borderline cell, use
2.3 to resolve it — "visible mainly in the T-zone" pushes toward
COMBINATION, "visible and enlarged across most of the face" pushes toward
OILY, "barely visible" pushes toward DRY/NORMAL.

→ Result stored as `Assessment.skinType`.

**Sensitivity is a separate, independent axis** — a patient can be
OILY-and-sensitive or DRY-and-sensitive, so it's tracked as its own overlay
rather than folded into the base type:

| # | Question | Options |
|---|---|---|
| 2.4 | Does your skin ever sting, burn, itch, or turn red after trying a new product, or in reaction to heat/cold/wind? | Rarely/never (0pt) · Occasionally (1pt) · Frequently (2pt) |
| 2.5 | Has a doctor diagnosed you with eczema, rosacea, or another reactive skin condition? | No (0pt) · Yes (2pt) |

**Rule:** if 2.4 + 2.5 ≥ 2 → `Assessment.sensitiveOverlay = true`. Any
matched rule then defaults to the lowest concentration in its tier and a
slower introduction schedule, regardless of what the base skin type alone
would suggest.

---

## Part 3 — Fitzpatrick Skin Type (self-assessment)

Directly relevant since this app is built for a heavily melanated patient
base. Two questions, based on the two classic Fitzpatrick criteria — natural
skin color and sun-reactivity — each scored 0–5, summed, and mapped to Type
I–VI. This determines how conservative the app should be with peel strength
and retinoid/AHA introduction pace, layered on top of whatever the concern
questions recommend.

| # | Question | Options (score) |
|---|---|---|
| 3.1 | What is your natural skin color on an area rarely exposed to sun (inner upper arm)? | Very pale/ivory (0) · Fair/light beige (1) · Light-medium/olive-beige (2) · Medium/tan-brown (3) · Deep brown (4) · Deeply pigmented, dark brown to black (5) |
| 3.2 | After roughly 30–45 minutes of your first strong, unprotected sun exposure of the season, what usually happens? | Always burns badly, never tans (0) · Burns easily, tans minimally (1) · Burns mildly, gradually tans light brown (2) · Rarely burns, tans well to moderate brown (3) · Very rarely burns, tans deeply (4) · Never burns, always deeply pigments (5) |

**Scoring:** sum 3.1 + 3.2 (range 0–10) →

| Sum | Fitzpatrick Type |
|---|---|
| 0–1 | Type I |
| 2–3 | Type II |
| 4–5 | Type III |
| 6–7 | Type IV |
| 8–9 | Type V |
| 10 | Type VI |

→ Stored as `Assessment.fitzpatrickType`. **Effect on the algorithm:** Type
IV–VI defaults to gentler peel strength (start of range, not top), a slower
retinoid/AHA build-up schedule, and tinted-sunscreen-with-iron-oxides framed
as non-negotiable rather than optional for any hyperpigmentation rule — all
of this layers on top of the concern-specific routine rather than replacing
it.

---

## Part 4 — Concern Selection

| # | Question | Options |
|---|---|---|
| 4.1 | Which of these would you like help with? *(select all that apply)* | Acne · Hyperpigmentation / dark spots · Sun damage · Fine lines & aging · General glow / even tone maintenance |

Multi-select, feeds `Assessment.concerns`. Each concern selected triggers
its own severity block below (Parts 5A–5D); "General glow" triggers Part 5E
instead, which works differently since it isn't a condition with a severity
scale.

---

## Part 5A — Acne Severity *(shown only if Acne selected)*

| # | Question | Options (points) |
|---|---|---|
| 5A.1 | Right now, how many active breakouts (pimples, whiteheads, blackheads) do you typically have at once? | 0–5 (0) · 6–15 (1) · 15+ (2) |
| 5A.2 | Do you currently have any deep, painful, cyst-like bumps under the skin? | None (0) · A few (1) · Several / this is my main concern (2) |
| 5A.3 | Has this level of breakouts continued for more than 3 months without improvement? | No (0) · Yes (1) |
| 5A.4 | Have you noticed scarring or dark marks left behind after breakouts heal? | No · Yes *(doesn't add to the acne score — flags a likely secondary Hyperpigmentation concern even if not separately selected, see Part 6 combination rules)* |

**Scoring:** sum 5A.1–5A.3 (range 0–5) → **0–1 = Mild · 2–3 = Moderate · 4–5 = Severe**

---

## Part 5B — Hyperpigmentation Severity *(shown only if selected)*

| # | Question | Options (points) |
|---|---|---|
| 5B.1 | How noticeable is the discoloration compared to your natural skin tone? | Barely noticeable (0) · A shade or two darker (1) · Several shades darker / widespread (2) |
| 5B.2 | How long have you had it? | Under 3 months (0) · 3–12 months (1) · Over a year (2) |
| 5B.3 | Does it get darker with sun exposure or heat? | No (0) · Yes (1) |
| 5B.4 | Where is it located? | A mask-like pattern on cheeks/forehead · Scattered spots from old breakouts · Patches in sun-exposed areas · Other |

**Scoring:** sum 5B.1 + 5B.2 (range 0–4) → **0–1 = Mild · 2 = Moderate · 3–4 = Severe**

5B.3 = Yes and 5B.4 = "mask-like pattern" together strongly suggest melasma
specifically (hormonally/UV driven) — flagged for the algorithm to prefer
tranexamic-acid-containing rules and treat tinted sunscreen as mandatory,
not just recommended.

---

## Part 5C — Sun Damage Severity *(shown only if selected)*

Sun damage severity is as much about current protective habits as visible
damage, so it's scored slightly differently:

| # | Question | Options (points) |
|---|---|---|
| 5C.1 | How often do you currently wear sunscreen? | Daily, reapply outdoors (0) · Daily, rarely reapply (1) · Sometimes (2) · Never (3) |
| 5C.2 | Do you currently notice any of: rough texture, fine lines from sun, uneven tone, visible sunspots, broken capillaries? *(count selected)* | 0 selected (0) · 1–2 selected (1) · 3+ selected (2) |

**Scoring:** sum 5C.1 + 5C.2 (range 0–5) → **0–1 = Mild · 2–3 = Moderate · 4–5 = Severe**

---

## Part 5D — Aging Severity *(shown only if selected)*

| # | Question | Options (points) |
|---|---|---|
| 5D.1 | Which best describes your main concern? | Fine lines only (0) · Deeper wrinkles (1) · Loss of firmness/sagging (2) · A combination of the above (2) |
| 5D.2 | Where do you notice it most? | Around the eyes · Around the mouth/nasolabial folds · Overall skin laxity · Not sure |
| 5D.3 | Have you already used anti-aging actives (retinoids, peptides, etc.)? | No, never · Yes, currently · Yes, in the past |

**Scoring:** 5D.1 alone → **0 = Mild · 1 = Moderate · 2 = Severe**

---

## Part 5E — Glowing Skin / General Radiance *(shown only if selected)*

Structurally different from the four concerns above — this isn't a
condition with a severity scale, it's a baseline-maintenance goal. Instead
of severity, it determines routine complexity:

| # | Question | Options |
|---|---|---|
| 5E.1 | What best describes your main goal? | More even tone · More hydrated/plump skin · Smoother texture · Overall brighter look · General maintenance |
| 5E.2 | How would you describe your current skincare routine? | None · Cleanse only · Cleanse + moisturize · Full routine with active ingredients |

`Assessment.severityByConcern` is left unset for `GLOWING_SKIN` — 5E.2
instead determines whether the matched routine starts at the simple
Clean/Moisturize/Protect baseline or the full six-step (Clean, Nourish,
Moisturize, Protect, Pamper, Treat) version.

---

## Part 6 — Anything else

| # | Question |
|---|---|
| 6.1 | Is there anything else about your skin or health you think we should know? *(free text)* |

Catches whatever the structured questions above don't anticipate — read by
the pharmacist/staff reviewing the assessment, not parsed by the matching
engine.

---

## Part 7 — Full Question → Algorithm Mapping Table

Every question above, in one place, with exactly what it drives. This is
the literal proof that nothing here is decorative.

| Question(s) | Schema field | Algorithm effect |
|---|---|---|
| 1.1 Age range | `ageRange` | Retinoid ceiling for minors; collagen-decline personalization tier (26–35 adds Vitamin C focus, 46–55+ adds retinoid-start-slow framing, etc.) |
| 1.2 Sex at birth | `biologicalSex` (on Patient) | Branching only — decides whether 1.3–1.6 are asked |
| 1.3 Pregnancy status | `pregnancyStatus` | **Hard block:** retinoids, hydroquinone, oral tranexamic acid (pregnant/breastfeeding/trying to conceive); high-dose salicylic acid and chemical peels (pregnant/breastfeeding only) |
| 1.4 Menopause status | `hormonalStage` | Perimenopausal/menopausal/post-menopausal biases toward barrier-repair and slow-start retinoid framing over aggressive actives |
| 1.5 Contraception/HRT | `onHormonalContraceptionOrHRT` | Contextual only for now — informs future acne/melasma rule refinement |
| 1.6 Cycle/hot flashes | `cycleRelatedFlares`, `hotFlashesOrNightSweats` | Confirms hormonal stage independent of the direct question |
| 1.6a Cycle pattern | `cyclePattern` | **[NEW]** "More breakouts/oilier" + Acne selected → Azelaic Acid/Niacinamide scoring bonus |
| 1.6b–c Texture change | `recentSkinTextureChange`, `textureChangeType` | **[NEW]** "More sensitive" → feeds `sensitiveOverlay` directly, same weight as 2.4/2.5 |
| 1.7 Allergies | `allergies` | Disqualifies any rule recommending a conflicting ingredient |
| 1.8 Known conditions | `knownSkinConditions` | Pushes toward gentler rule tier regardless of concern severity |
| 1.9 Current medications | `currentMedications` | Avoids redundant/conflicting recommendations |
| 1.10 Previous treatments | `previousTreatments` | Avoids re-recommending something already tried; signals whether to start conservative or escalate |
| 2.1–2.3 Skin behavior | `skinType` | Base rule matching — which routine's skin-type condition applies |
| 2.4–2.5 Reactivity | `sensitiveOverlay` | Forces lowest concentration tier + slower introduction, on top of whatever skinType/concern selected |
| 3.1–3.2 Fitzpatrick | `fitzpatrickType` | Gentler peel/retinoid pacing default for Type IV–VI; tinted sunscreen framed as mandatory for hyperpigmentation |
| 4.1 Concern selection | `concerns` | Which rule pool is even considered |
| 5A–5D severity questions | `severityByConcern` | Which severity tier of an otherwise-matching rule scores highest (mild/moderate/severe routine intensity) |
| 5A.4 Scarring | *(not stored directly)* | Suggests adding a Hyperpigmentation-supportive ingredient (e.g. azelaic acid) even to an Acne-only routine |
| 5B.3–5B.4 Melasma pattern | *(not stored directly)* | Biases toward tranexamic-acid rules and mandatory tinted sunscreen |
| 5E.2 Routine familiarity | *(not stored directly — determines routine step count)* | Simple vs. full six-step routine structure |
| 6.1 Free text | *(not parsed — human review only)* | Read by clinic staff, not the engine |

---

## Status of the items originally listed here

All three of the original open items are done — noted here so this doesn't
read as still-pending:

1. ~~Combination-concern rules~~ — built. 4 combination rules exist in
   `prisma/rules-data.ts` (Acne+Hyperpigmentation, Acne+Aging,
   Hyperpigmentation+Sun Damage, Aging+Sun Damage), scored to outrank a
   single-concern rule whenever both concerns are selected.
2. ~~UI build-out~~ — done. `AssessmentForm.tsx` covers every question in
   this document.
3. ~~Rule data~~ — done. 20 real `SkincareRule` rows exist in
   `prisma/rules-data.ts`, replacing the old placeholder dummy data.
