-- Generated from prisma/rules-data.ts — do not edit by hand.
-- Paste this whole file into Neon's SQL Editor and run it.
-- Safe to re-run any time rules-data.ts changes: it upserts by
-- rule name, so existing rows get updated rather than duplicated.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Acne — Mild', '{"concerns":["ACNE"],"severity":["MILD"]}'::jsonb, '{"am":["Gentle cleanser","Niacinamide 2–5% serum","Lightweight oil-free moisturizer","Broad-spectrum SPF 30+"],"pm":["Gentle cleanser","Salicylic Acid 0.5–2% treatment (or Adapalene 0.1% if tolerated)","Oil-free moisturizer"]}'::jsonb, ARRAY['Salicylic Acid 0.5–2%', 'Adapalene 0.1%', 'Niacinamide 2–5%'], ARRAY['Ceramide Barrier Repair Cream'], 28, false, NULL, now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Acne — Moderate', '{"concerns":["ACNE"],"severity":["MODERATE"]}'::jsonb, '{"am":["Gentle cleanser","Benzoyl Peroxide 2.5–5%","Niacinamide 4–5% serum","Oil-free moisturizer","Broad-spectrum SPF 30+"],"pm":["Gentle cleanser","Adapalene 0.1%","Oil-free moisturizer"]}'::jsonb, ARRAY['Benzoyl Peroxide 2.5–5%', 'Adapalene 0.1%', 'Niacinamide 4–5%'], ARRAY['Salicylic Acid 2% Cleanser'], 56, false, 'If no improvement after 8–12 weeks, consider a prescription-strength retinoid or oral antibiotics — refer to a dermatologist.', now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Acne — Severe', '{"concerns":["ACNE"],"severity":["SEVERE"]}'::jsonb, '{"am":["Gentle cleanser","Benzoyl Peroxide 5–10%","Niacinamide serum","Oil-free moisturizer","Broad-spectrum SPF 30+"],"pm":["Gentle cleanser","Adapalene 0.1%","Oil-free moisturizer"]}'::jsonb, ARRAY['Benzoyl Peroxide 5–10%', 'Adapalene 0.1%', 'Niacinamide'], ARRAY['Salicylic Acid 2% Cleanser'], 30, false, 'Severe/cystic pattern — this OTC combination is a bridge, not a resolution. Refer to a dermatologist for prescription-strength retinoid or oral isotretinoin if cysts/nodules are present, or if there is no improvement within 4 weeks.', now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Acne — Pregnancy-Safe', '{"concerns":["ACNE"]}'::jsonb, '{"am":["Gentle cleanser","Azelaic Acid 10% serum","Niacinamide serum","Mineral SPF 30+ (Zinc Oxide/Titanium Dioxide)"],"pm":["Gentle cleanser","Benzoyl Peroxide 2.5% spot treatment","Fragrance-free moisturizer"]}'::jsonb, ARRAY['Azelaic Acid 10–15%', 'Benzoyl Peroxide 2.5–5%', 'Niacinamide'], ARRAY[]::text[], 28, false, 'Pregnancy-safe routine. If acne is severe or not improving, refer to OB-GYN or dermatologist before adding anything further.', now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Hyperpigmentation — Mild', '{"concerns":["HYPERPIGMENTATION"],"severity":["MILD"]}'::jsonb, '{"am":["Gentle cleanser","Vitamin C 10–20% + Ferulic Acid serum","Niacinamide moisturizer","Tinted SPF 30+ with iron oxides"],"pm":["Gentle cleanser","Azelaic Acid 10% serum","Moisturizer"]}'::jsonb, ARRAY['Azelaic Acid 10%', 'Vitamin C 10–20%', 'Niacinamide'], ARRAY['Tranexamic Acid Dark Spot Serum'], 28, false, NULL, now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Hyperpigmentation — Moderate', '{"concerns":["HYPERPIGMENTATION"],"severity":["MODERATE"]}'::jsonb, '{"am":["Gentle cleanser","Vitamin C + Ferulic Acid serum","Niacinamide moisturizer","Tinted SPF 50+ with iron oxides — non-negotiable"],"pm":["Gentle cleanser","Tranexamic Acid 3–5% + Azelaic Acid 10% serum","Moisturizer"]}'::jsonb, ARRAY['Tranexamic Acid 3–5%', 'Azelaic Acid 10%', 'Niacinamide', 'Vitamin C'], ARRAY['Tranexamic Acid Dark Spot Serum'], 56, false, 'If no improvement after 12–16 weeks, may benefit from prescription-strength intervention — refer for pharmacy/dermatologist evaluation.', now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Hyperpigmentation — Severe', '{"concerns":["HYPERPIGMENTATION"],"severity":["SEVERE"]}'::jsonb, '{"am":["Gentle cleanser","Vitamin C + Ferulic Acid serum","Niacinamide moisturizer","Tinted SPF 50+ with iron oxides — non-negotiable"],"pm":["Gentle cleanser","Tranexamic Acid 3–5% + Azelaic Acid 10% serum","Moisturizer"]}'::jsonb, ARRAY['Tranexamic Acid 3–5%', 'Azelaic Acid 10%', 'Niacinamide', 'Vitamin C'], ARRAY['Tranexamic Acid Dark Spot Serum'], 30, false, 'Severe/widespread pigmentation, possibly melasma — this OTC combination is a starting point, not the ceiling. May benefit from prescription-strength intervention — requires assessment and prescription from a licensed physician before dispensing.', now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Hyperpigmentation — Severe (Pharmacy-Verified)', '{"concerns":["HYPERPIGMENTATION"],"severity":["SEVERE"]}'::jsonb, '{"am":["Gentle cleanser","Vitamin C + Ferulic Acid serum","Niacinamide moisturizer","Tinted SPF 50+ with iron oxides — non-negotiable"],"pm":["Gentle cleanser","Tranexamic Acid 3–5% + Azelaic Acid 10% serum","Moisturizer"]}'::jsonb, ARRAY['Tranexamic Acid 3–5%', 'Azelaic Acid 10%', 'Niacinamide', 'Vitamin C'], ARRAY['Tranexamic Acid Dark Spot Serum'], 30, true, 'Severe/widespread pigmentation, possibly melasma. Prescription-tier options a physician may consider: short-course 4% hydroquinone, or a compounded triple-combination formula (hydroquinone + tretinoin + a mild corticosteroid) — never dispensed without a valid prescription and physician supervision, and never continuous beyond 3–4 months.', now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Sun Damage — Mild', '{"concerns":["SUN_DAMAGE"],"severity":["MILD"]}'::jsonb, '{"am":["Gentle cleanser","Vitamin C + Vitamin E + Ferulic Acid serum","Lightweight moisturizer","Broad-spectrum SPF 30+, reapply every 2 hours outdoors"],"pm":["Gentle cleanser","Niacinamide serum","Moisturizer"]}'::jsonb, ARRAY['Vitamin C 10–20%', 'Vitamin E', 'Ferulic Acid', 'Niacinamide'], ARRAY['Mineral SPF 50 Sunscreen'], 30, false, NULL, now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Sun Damage — Moderate', '{"concerns":["SUN_DAMAGE"],"severity":["MODERATE"]}'::jsonb, '{"am":["Gentle cleanser","Vitamin C + Ferulic Acid + Vitamin E serum","Green Tea Extract moisturizer","Broad-spectrum SPF 50, reapply every 2 hours"],"pm":["Gentle cleanser","Niacinamide serum","Barrier-repair moisturizer"]}'::jsonb, ARRAY['Vitamin C 10–20%', 'Green Tea Extract (EGCG)', 'Niacinamide', 'Ferulic Acid'], ARRAY['Mineral SPF 50 Sunscreen'], 42, false, NULL, now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Sun Damage — Severe', '{"concerns":["SUN_DAMAGE"],"severity":["SEVERE"]}'::jsonb, '{"am":["Gentle cleanser","Vitamin C + Ferulic Acid + Vitamin E serum","Green Tea Extract moisturizer","Broad-spectrum SPF 50, reapply every 2 hours"],"pm":["Gentle cleanser","Niacinamide serum","Barrier-repair moisturizer"]}'::jsonb, ARRAY['Vitamin C 10–20%', 'Green Tea Extract', 'Niacinamide', 'Ferulic Acid'], ARRAY['Mineral SPF 50 Sunscreen'], 30, false, 'Visible damage with inconsistent sunscreen use — daily SPF is the single highest-leverage change here. If broken capillaries or significant texture change are present, consider referral for in-office treatment (e.g. laser) alongside this routine.', now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Aging — Mild (Fine Lines)', '{"concerns":["AGING"],"severity":["MILD"]}'::jsonb, '{"am":["Gentle cleanser","Vitamin C 10–20% serum","Peptide moisturizer","Broad-spectrum SPF 30+"],"pm":["Gentle cleanser","Retinaldehyde or low-strength Retinol — start 2x/week, build up","Hyaluronic Acid + Ceramide moisturizer"]}'::jsonb, ARRAY['Vitamin C 10–20%', 'Peptides', 'Retinaldehyde', 'Hyaluronic Acid'], ARRAY['Retinal 0.1% Night Cream'], 84, false, NULL, now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Aging — Moderate (Deeper Wrinkles)', '{"concerns":["AGING"],"severity":["MODERATE"]}'::jsonb, '{"am":["Gentle cleanser","Vitamin C + Vitamin E + Ferulic Acid serum","Peptide moisturizer","Broad-spectrum SPF 30+"],"pm":["Gentle cleanser","Retinaldehyde/Retinol, nightly once tolerated","Hyaluronic Acid + Ceramide + Peptide night cream"]}'::jsonb, ARRAY['Vitamin C', 'Peptides (Matrixyl, Argireline)', 'Retinaldehyde', 'Ceramides'], ARRAY['Retinal 0.1% Night Cream'], 120, false, 'If limited improvement after 24 weeks, consider prescription-strength Tretinoin — refer to a dermatologist.', now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Aging — Severe (Loss of Firmness)', '{"concerns":["AGING"],"severity":["SEVERE"]}'::jsonb, '{"am":["Gentle cleanser","Vitamin C + Vitamin E + Ferulic Acid serum","Peptide moisturizer","Broad-spectrum SPF 30+"],"pm":["Gentle cleanser","Retinaldehyde/Retinol, nightly once tolerated","Hyaluronic Acid + Ceramide + Peptide + CoQ10 night cream"]}'::jsonb, ARRAY['Vitamin C', 'Peptides', 'Retinaldehyde', 'Coenzyme Q10', 'Ceramides'], ARRAY['Retinal 0.1% Night Cream'], 120, false, 'Significant firmness loss — this routine helps but has a ceiling. Consider referral for in-office collagen-stimulating treatment (e.g. microneedling, laser) alongside the daily routine, and prescription-strength Tretinoin if not already in use.', now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Aging — Pregnancy-Safe', '{"concerns":["AGING"]}'::jsonb, '{"am":["Gentle cleanser","Vitamin C 10–20% serum","Hyaluronic Acid + Peptide moisturizer","Mineral SPF 30+"],"pm":["Gentle cleanser","Bakuchiol 0.5–2% (retinol alternative, pregnancy-safe)","Ceramide moisturizer"]}'::jsonb, ARRAY['Bakuchiol 0.5–2%', 'Vitamin C', 'Peptides', 'Hyaluronic Acid'], ARRAY[]::text[], 84, false, 'Pregnancy-safe routine — retinoids can resume postpartum/after breastfeeding if desired.', now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Glowing Skin — Six-Step Routine', '{"concerns":["GLOWING_SKIN"]}'::jsonb, '{"am":["Gentle cleanser (Glycerin, Panthenol)","Vitamin C 10–20% + Ferulic Acid + Vitamin E serum","Hyaluronic Acid + Ceramide + Niacinamide moisturizer","Broad-spectrum SPF 30–50+ (tinted if also addressing hyperpigmentation)"],"pm":["Gentle cleanser","Hyaluronic Acid + Ceramide + Niacinamide moisturizer","Night cream or mask — Hyaluronic Acid + Peptides + Ceramides"]}'::jsonb, ARRAY['Niacinamide', 'Ceramides', 'Hyaluronic Acid', 'Vitamin C', 'Glycerin', 'Panthenol'], ARRAY['Ceramide Barrier Repair Cream'], 30, false, NULL, now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Combination — Acne + Hyperpigmentation', '{"concerns":["ACNE","HYPERPIGMENTATION"]}'::jsonb, '{"am":["Gentle cleanser","Niacinamide + Vitamin C serum","Oil-free moisturizer","Tinted SPF 30+ with iron oxides"],"pm":["Gentle cleanser","Azelaic Acid 10–15% (treats both active acne and post-acne marks)","Oil-free moisturizer"]}'::jsonb, ARRAY['Azelaic Acid 10–15%', 'Niacinamide', 'Vitamin C'], ARRAY['Tranexamic Acid Dark Spot Serum'], 42, false, NULL, now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Combination — Acne + Aging', '{"concerns":["ACNE","AGING"]}'::jsonb, '{"am":["Gentle cleanser","Vitamin C + Niacinamide serum","Oil-free moisturizer","Broad-spectrum SPF 30+"],"pm":["Gentle cleanser","Adapalene 0.1% (serves both acne and early anti-aging)","Oil-free moisturizer"]}'::jsonb, ARRAY['Adapalene 0.1%', 'Niacinamide', 'Vitamin C'], ARRAY['Salicylic Acid 2% Cleanser'], 56, false, NULL, now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Combination — Hyperpigmentation + Sun Damage', '{"concerns":["HYPERPIGMENTATION","SUN_DAMAGE"]}'::jsonb, '{"am":["Gentle cleanser","Vitamin C + Ferulic Acid + Vitamin E serum","Niacinamide moisturizer","Tinted SPF 50+ with iron oxides — non-negotiable"],"pm":["Gentle cleanser","Tranexamic Acid + Azelaic Acid serum","Moisturizer"]}'::jsonb, ARRAY['Tranexamic Acid 3–5%', 'Azelaic Acid', 'Vitamin C', 'Niacinamide'], ARRAY['Tranexamic Acid Dark Spot Serum', 'Mineral SPF 50 Sunscreen'], 42, false, NULL, now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Combination — Aging + Sun Damage', '{"concerns":["AGING","SUN_DAMAGE"]}'::jsonb, '{"am":["Gentle cleanser","Vitamin C + Vitamin E + Ferulic Acid serum","Peptide moisturizer","Broad-spectrum SPF 50+"],"pm":["Gentle cleanser","Retinaldehyde — build up gradually","Hyaluronic Acid + Ceramide moisturizer"]}'::jsonb, ARRAY['Vitamin C', 'Vitamin E', 'Ferulic Acid', 'Peptides', 'Retinaldehyde'], ARRAY['Retinal 0.1% Night Cream', 'Mineral SPF 50 Sunscreen'], 56, false, NULL, now(), now())
ON CONFLICT ("name") DO UPDATE SET
  condition = EXCLUDED.condition,
  routine = EXCLUDED.routine,
  ingredients = EXCLUDED.ingredients,
  upsells = EXCLUDED.upsells,
  "followUpDays" = EXCLUDED."followUpDays",
  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",
  "escalationNote" = EXCLUDED."escalationNote",
  "updatedAt" = now();

