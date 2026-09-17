# MyGlowBack.AI — Assessment & Algorithm Test Plan

**How to use this:** every scenario below tells you exactly which account to
log in as, exactly which buttons/fields to use, and exactly what you should
see. Priority 1 scenarios are safety-critical — test these first. Priority 2
rounds out completeness once Priority 1 is solid.

## Accounts you'll use for every scenario below

Created by `setup-test-accounts.sql` — if you haven't run that yet, do that
first, then come back here.

| Role | Email | Password | Use it for |
|---|---|---|---|
| Super Admin | `admin@myglowback.ai` | `ChangeMe123!` | Scenarios #37–40, verifying the sandbox clinic for #9 |
| Sandbox Clinic Admin | `admin@myglowback-test.ng` | `ChangeMe123!` | Most scenarios below — this is your main testing login |
| Sandbox Staff #1 | `staff1@myglowback-test.ng` | `ChangeMe123!` | Role-based access tests; will be tagged Pharmacist |
| Sandbox Staff #2 | `staff2@myglowback-test.ng` | `ChangeMe123!` | Role-based access tests; stays Support Staff |

**Do not use your real GlowHaus login for any of this** — that's your real
business data. Everything below runs against "MyGlowBack Test Sandbox," a
completely separate clinic that only exists for testing.

**The one screen you'll use over and over:** log in, go to
`/dashboard/assessments/new`, create/select any test patient (the name never
matters), click through the wizard answering only what each scenario tells
you to, and land on the results page to check what it produced. Everything
else on the way (age, other concerns, safety questions) can be anything
unless a scenario specifically says otherwise.

---

## Priority 1 — Safety-Critical (test these first)

These prove the hard-block logic actually blocks things, not just that it
exists in the code. **Log in as Sandbox Clinic Admin for all six.**

| # | Patient archetype | Exact answers to enter | What should happen |
|---|---|---|---|
| 1 | Pregnant, acne | Sex: Female · when the pregnancy question appears, pick Pregnant · Concern: Acne (any severity answers) | Result routine uses **Azelaic Acid + Benzoyl Peroxide only**. Read every line of the AM and PM routine — Adapalene must not appear anywhere |
| 2 | Trying to conceive, aging | Sex: Female · Pregnancy question: Trying to conceive · Concern: Aging (any severity) | Routine uses **Bakuchiol**, not Retinaldehyde or Retinol |
| 3 | Breastfeeding, hyperpigmentation | Sex: Female · Pregnancy question: Breastfeeding · Concern: Hyperpigmentation only · Severity answers: "Several shades darker/widespread" + "Over a year" (→ Severe) | Should get **"Hyperpigmentation — Severe"** with Tranexamic Acid + Azelaic Acid in the core routine. **If you land on "Hyperpigmentation — Mild" instead, or an empty/generic result, that's a bug** — Severe should never get downgraded for this patient |
| 4 | Under 18, acne | Age range: Under 18 · Concern: Acne · Severity answers to hit Severe (15+ breakouts, several cysts, chronic 3+ months) | Routine should include **Adapalene 0.1%** — confirm it's NOT missing or swapped out just because the patient is a minor |
| 5 | Male patient | Sex: Male | Keep clicking through Part 1 — confirm the pregnancy/menopause/hormonal questions **never appear on screen at all**, not even briefly |
| 6 | "Prefer not to say" | Sex: Prefer not to say | Confirm the pregnancy question **does** appear — this should behave like Female, not like Male |

---

## Priority 1 — Pharmacy Verification Gate

**This is the section that tripped you up before — here's the exact
sequence, start to finish.** All three scenarios use the same sandbox
clinic, moving it through three states in order. Do them in this order —
#8 and #9 depend on #7 already being done.

### #7 — Unverified clinic (do this first, no setup needed)

The sandbox clinic already starts in this state — nothing to configure.

1. Log in as **Sandbox Clinic Admin**
2. `/dashboard/assessments/new` → any patient → Concern: **Hyperpigmentation only**
3. Severity answers: "Several shades darker/widespread" + "Over a year"
4. Finish → check the result

**Expect:** routine titled **"Hyperpigmentation — Severe"** (not
"Pharmacy-Verified"). If there's an escalation note, it should say something
generic like *"may benefit from above-2% prescription-strength
intervention"* — it must **not** name hydroquinone or mention Kligman's/
triple-combination by name.

### #8 — Clinic claims Pharmacy but isn't verified yet

1. Log in as **Super Admin** (`admin@myglowback.ai`)
2. Find **MyGlowBack Test Sandbox** in the clinic list
3. In the license editor next to it, set **License Type → Pharmacy**, but
   **do not** check/set verified yet
4. Log back in as **Sandbox Clinic Admin**, repeat the exact same assessment
   as #7 (Hyperpigmentation, same severity answers)

**Expect:** identical result to #7. Self-declaring "we're a pharmacy" must
not unlock anything on its own — only verification does.

### #9 — Verified pharmacy

1. Log in as **Super Admin** again
2. Same clinic, same license editor — this time actually mark it
   **verified** (enter any PCN number, confirm)
3. Log back in as **Sandbox Clinic Admin**, repeat the same assessment once
   more

**Expect:** now you should see **"Hyperpigmentation — Severe
(Pharmacy-Verified)"**, and the escalation note now does name hydroquinone/
Kligman's specifically — but still framed as "a pharmacist may consider
dispensing," never as a direct instruction. You should also see a
**"Prescription only"** badge on the result page listing the prescription
options.

*(Leave the clinic verified afterward — later scenarios below assume it's
already verified.)*

---

## Priority 1 — Role-Based Access

This is the section with the most moving parts — three different logins,
testing what each can and can't reach. **The single most important test in
this whole document is #47** — a real leak there means one clinic could see
another clinic's actual patient data.

| # | Do this | Expect |
|---|---|---|
| 37 | Log in as **Super Admin**. Look at the left nav. | Should see "Super Admin." Also notice whether Overview/Patients/etc. show too — Super Admin has no `clinicId` of its own, so this is worth a screenshot either way |
| 38 | While still Super Admin, go straight to `/dashboard` (not `/dashboard/super-admin`) | Should not crash or show broken/blank data — either a sensible empty state or a redirect |
| 39 | Still Super Admin: set a locked price on the sandbox clinic, then check that clinic's billing/checkout page (as Clinic Admin) | The locked amount should be what actually shows at checkout, not the standard rate |
| 40 | Still Super Admin, go to `/dashboard/super-admin/analytics` | Should load a KPI dashboard — conversion rate, MRR, weekly trends |
| 41 | Log in as **Sandbox Clinic Admin**. Type `/dashboard/super-admin` directly into the address bar | Should be blocked outright, not just missing from the nav |
| 42 | Still Clinic Admin: try calling the locked-price API directly (browser dev tools → Network tab, or a tool like Postman) | Should be rejected — only Super Admin may set locked pricing |
| 43 | Still Clinic Admin: open Inventory and Billing normally through the nav | Both should work fully, no restriction |
| 44 | Log in as **Sandbox Staff #1 or #2**. Type `/dashboard/billing` and `/dashboard/inventory` directly into the address bar | Should be blocked outright — this is server-enforced, confirmed directly in the code |
| 45 | Still a Staff account: run a full assessment end to end (`/dashboard/assessments/new`) | Should work completely — this is Staff's core job |
| 46 | Still a Staff account: go to `/dashboard/feedback`, submit an item, vote on it | Should work — Staff can submit and vote same as Clinic Admin |
| 47 | **The important one.** While logged in as any Sandbox account, open a real assessment/patient from your **real GlowHaus clinic** by guessing or editing the URL's ID (copy a GlowHaus assessment ID from your other browser tab/session, paste it into the sandbox session's address bar) | Must be blocked. If it loads GlowHaus data while logged into the sandbox account, that's a critical leak — stop and flag it immediately, don't wait to finish the rest of the checklist |
| 48 | As Super Admin, go to the sandbox clinic's settings and set it inactive/lapsed. Try logging in as Sandbox Clinic Admin and Staff | Both should hit a lockout screen. Then log in as Super Admin again and confirm **you're not** locked out of that same clinic — Super Admin needs to be able to review/reactivate lapsed clinics |

*(After #48, remember to set the sandbox clinic back to active if you want to keep testing with it.)*

---

## Priority 2 — Severity Tier Coverage

**Log in as Sandbox Clinic Admin.** Same screen every time —
`/dashboard/assessments/new` → pick the one concern listed → enter exactly
the answers shown → check the result matches.

| # | Concern | Exact answers | Expected result |
|---|---|---|---|
| 10 | Acne | 0–5 breakouts · no cysts · "no" to chronic 3+ months | Acne — Mild |
| 11 | Acne | 6–15 breakouts · a few cysts | Acne — Moderate |
| 12 | Acne | 15+ breakouts · several cysts · "yes" to chronic 3+ months | Acne — Severe, with a dermatologist-referral note |
| 13 | Hyperpigmentation | "Barely noticeable" · "Under 3 months" | Hyperpigmentation — Mild |
| 14 | Hyperpigmentation | "A shade or two darker" · "3–12 months" | Hyperpigmentation — Moderate |
| 15 | Hyperpigmentation | "Several shades darker" · "Over a year" | Hyperpigmentation — Severe |
| 16 | Sun Damage | "Daily, reapply outdoors" · 0 visible signs selected | Sun Damage — Mild |
| 17 | Sun Damage | "Never" wears sunscreen · 3+ visible signs selected | Sun Damage — Severe |
| 18 | Aging | "Fine lines only" | Aging — Mild |
| 19 | Aging | "Loss of firmness/sagging" | Aging — Severe |

---

## Priority 2 — Objective Skin Type Determination

Same screen, but this time it's the T-zone/cheeks/pores questions in Part 2
that matter — concern selection doesn't matter for these, pick anything.

| # | T-zone | Cheeks | Pores | Expected |
|---|---|---|---|---|
| 20 | Shiny/oily | Shiny/oily | Visible, most of face | OILY |
| 21 | Tight/dry | Tight/dry | Barely visible | DRY |
| 22 | Comfortable | Comfortable | Barely visible | NORMAL |
| 23 | Shiny/oily | Tight/dry | Visible mainly T-zone | COMBINATION — the one worth double-checking, it's the classic mixed pattern |
| 24 | Any of the above, plus: answer "Frequently" to the stinging/burning question **and** "Yes" to doctor-diagnosed reactive condition | | | Confirms sensitivity is tracked independently — do this once on top of an OILY result specifically, not just DRY, to confirm it's not accidentally tied to skin type |

---

## Priority 2 — Fitzpatrick Range

Part 3 questions — natural tone and sun-reaction. Concern doesn't matter.

| # | Natural tone answer | Sun reaction answer | Expected |
|---|---|---|---|
| 25 | "Very pale/ivory" | "Always burns badly, never tans" | Type I |
| 26 | "Deeply pigmented, dark brown to black" | "Never burns, always deeply pigments" | Type VI |
| 27 | "Medium/tan-brown" | "Rarely burns, tans well" | Type IV — worth extra attention, most real patients will land here |

---

## Priority 2 — Combination Rules

Select **two** concerns on the Concerns step (not one). The thing to check:
one coherent combined routine — not one concern's routine with the other
silently dropped.

| # | Select both | Expect | Specifically check |
|---|---|---|---|
| 28 | Acne + Hyperpigmentation | Combination routine | Azelaic Acid is the anchor active — not a plain Acne routine with hyperpigmentation missing |
| 29 | Acne + Aging | Combination routine | One Adapalene-based routine — not two separate retinoid steps competing |
| 30 | Hyperpigmentation + Sun Damage | Combination routine | Tinted sunscreen called out as non-negotiable |
| 31 | Aging + Sun Damage | Combination routine | Vitamin C/E/Ferulic antioxidant stack is prominent |
| 32 | All 5 concerns at once | *(stress test)* | Just confirm it doesn't crash or return empty — any real, complete routine is a pass |

---

## Priority 2 — Glowing Skin & Fallback

| # | Do this | Expect |
|---|---|---|
| 33 | Select only "Glowing Skin" | A six-step routine (Clean/Nourish/Moisturise/Protect/Pamper/Treat) — no severity questions should appear for this concern at all |
| 34 | Select Acne or Hyperpigmentation, then in the allergies free-text field type "azelaic acid" | The result should skip any rule containing azelaic acid and fall back to the next valid rule — confirm azelaic acid genuinely doesn't appear, and it's not just the empty generic fallback if a real alternative exists |
| 35 | Try a severity/concern combo you don't expect coverage for | Should return the safe generic fallback (gentle cleanser, fragrance-free moisturizer, mineral SPF), never an error |

---

## Priority 2 — Products & Upsells

| # | Do this | Expect |
|---|---|---|
| 36 | Run any assessment against your real **GlowHaus** clinic (its actual seeded inventory) | In-stock products tagged with a matching concern appear as matched products; anything marked as an upsell shows separately, not mixed into the main routine |

---

## After you're done

- A **Priority 1 failure is stop-everything** — screenshot it exactly like we've done with bugs earlier in this project, and it gets fixed before anything else.
- A **Priority 2 failure** usually just means a rule's condition needs a small adjustment — still worth flagging, less urgent.
- Once this whole list passes, you're done with QA for this build — genuinely clear to move to prospecting.
