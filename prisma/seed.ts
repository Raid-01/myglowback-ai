import { PrismaClient, Role, BillingCycle, SkinType, Concern } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MyGlowBack.AI...');

  // ── Super admin (you) ─────────────────────────────────────────────
  const superAdminPassword = await bcrypt.hash('ChangeMe123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@myglowback.ai' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@myglowback.ai',
      password: superAdminPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  // ── Demo clinic ────────────────────────────────────────────────────
  const now = new Date();
  const oneYearOut = new Date(now);
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);

  const clinic = await prisma.clinic.upsert({
    where: { email: 'hello@glowhausclinic.ng' },
    update: {},
    create: {
      name: 'GlowHaus Clinic',
      email: 'hello@glowhausclinic.ng',
      phone: '+2348012345678',
      address: '14 Adeola Odeku St, Victoria Island, Lagos',
      billingCycle: BillingCycle.ANNUAL,
      subscriptionStart: now,
      subscriptionEnd: oneYearOut,
      isActive: true,
    },
  });

  const location = await prisma.location.create({
    data: {
      name: 'GlowHaus — Victoria Island',
      address: '14 Adeola Odeku St, Victoria Island, Lagos',
      phone: '+2348012345678',
      clinicId: clinic.id,
    },
  });

  const clinicAdminPassword = await bcrypt.hash('ChangeMe123!', 10);
  const clinicAdmin = await prisma.user.upsert({
    where: { email: 'admin@glowhausclinic.ng' },
    update: {},
    create: {
      name: 'Amaka Johnson',
      email: 'admin@glowhausclinic.ng',
      password: clinicAdminPassword,
      role: Role.CLINIC_ADMIN,
      clinicId: clinic.id,
    },
  });

  const staffPassword = await bcrypt.hash('ChangeMe123!', 10);
  await prisma.user.upsert({
    where: { email: 'staff@glowhausclinic.ng' },
    update: {},
    create: {
      name: 'Tolu Bakare',
      email: 'staff@glowhausclinic.ng',
      password: staffPassword,
      role: Role.STAFF,
      clinicId: clinic.id,
    },
  });

  // ── First invoice (mirrors what sign-up flow generates) ────────────
  await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-${Date.now()}`,
      clinicId: clinic.id,
      amount: 450000,
      totalDue: 450000,
      status: 'PAID',
      dueDate: now,
      paidAt: now,
    },
  });

  // ── Demo products, tagged by concern ────────────────────────────────
  await prisma.product.createMany({
    data: [
      {
        name: 'Salicylic Acid 2% Cleanser',
        brand: 'ClearDerm',
        category: 'Cleanser',
        price: 8500,
        stockQuantity: 40,
        activeIngredients: ['Salicylic Acid'],
        concerns: [Concern.ACNE],
        clinicId: clinic.id,
      },
      {
        name: 'Niacinamide 10% Serum',
        brand: 'BrightLab',
        category: 'Serum',
        price: 12000,
        stockQuantity: 25,
        activeIngredients: ['Niacinamide', 'Zinc'],
        concerns: [Concern.ACNE, Concern.HYPERPIGMENTATION],
        clinicId: clinic.id,
      },
      {
        name: 'Tranexamic Acid Dark Spot Serum',
        brand: 'BrightLab',
        category: 'Serum',
        price: 15500,
        stockQuantity: 18,
        activeIngredients: ['Tranexamic Acid', 'Vitamin C'],
        concerns: [Concern.HYPERPIGMENTATION],
        clinicId: clinic.id,
      },
      {
        name: 'Mineral SPF 50 Sunscreen',
        brand: 'SunGuard',
        category: 'Sunscreen',
        price: 9500,
        stockQuantity: 60,
        activeIngredients: ['Zinc Oxide', 'Titanium Dioxide'],
        concerns: [Concern.SUN_DAMAGE, Concern.AGING],
        clinicId: clinic.id,
      },
      {
        name: 'Retinal 0.1% Night Cream',
        brand: 'AgeLab',
        category: 'Moisturizer',
        price: 21000,
        stockQuantity: 15,
        activeIngredients: ['Retinaldehyde', 'Peptides'],
        concerns: [Concern.AGING],
        isUpsell: true,
        clinicId: clinic.id,
      },
      {
        name: 'Ceramide Barrier Repair Cream',
        brand: 'ClearDerm',
        category: 'Moisturizer',
        price: 11000,
        stockQuantity: 30,
        activeIngredients: ['Ceramides', 'Cholesterol'],
        concerns: [Concern.ACNE, Concern.SUN_DAMAGE, Concern.AGING],
        isUpsell: true,
        clinicId: clinic.id,
      },
    ],
    skipDuplicates: true,
  });

  // ── Real SkincareRules, from MASTER_ALGORITHM.md ────────────────────
  // upsert (not createMany) so re-running this seed after editing a rule's
  // content updates it in place rather than creating a duplicate — relies
  // on the @unique constraint on SkincareRule.name.
  const rules: Array<{
    name: string;
    condition: object;
    routine: object;
    ingredients: string[];
    upsells: string[];
    followUpDays: number;
    requiresLicensedPharmacy?: boolean;
    escalationNote?: string;
  }> = [
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
        pm: ['Gentle cleanser', 'Tranexamic Acid 3–5% + Azelaic Acid 10% serum', 'Moisturizer'],
      },
      ingredients: ['Tranexamic Acid 3–5%', 'Azelaic Acid 10%', 'Niacinamide', 'Vitamin C'],
      upsells: ['Tranexamic Acid Dark Spot Serum'],
      followUpDays: 56,
      escalationNote: 'If no improvement after 12–16 weeks, may benefit from prescription-strength intervention — refer for pharmacy/dermatologist evaluation.',
    },
    {
      name: 'Hyperpigmentation — Severe',
      condition: { concerns: ['HYPERPIGMENTATION'], severity: ['SEVERE'] },
      routine: {
        am: ['Gentle cleanser', 'Vitamin C + Ferulic Acid serum', 'Niacinamide moisturizer', 'Tinted SPF 50+ with iron oxides — non-negotiable'],
        pm: ['Gentle cleanser', 'Tranexamic Acid 3–5% + Azelaic Acid 10% serum', 'Moisturizer'],
      },
      ingredients: ['Tranexamic Acid 3–5%', 'Azelaic Acid 10%', 'Niacinamide', 'Vitamin C'],
      upsells: ['Tranexamic Acid Dark Spot Serum'],
      followUpDays: 30,
      escalationNote: 'Severe/widespread pigmentation, possibly melasma — this OTC combination is a starting point, not the ceiling. May benefit from prescription-strength intervention — requires assessment and prescription from a licensed physician before dispensing.',
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
      escalationNote: 'Severe/widespread pigmentation, possibly melasma. Prescription-tier options a physician may consider: short-course 4% hydroquinone, or a compounded triple-combination formula (hydroquinone + tretinoin + a mild corticosteroid) — never dispensed without a valid prescription and physician supervision, and never continuous beyond 3–4 months.',
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

  for (const rule of rules) {
    await prisma.skincareRule.upsert({
      where: { name: rule.name },
      update: {
        condition: rule.condition,
        routine: rule.routine,
        ingredients: rule.ingredients,
        upsells: rule.upsells,
        followUpDays: rule.followUpDays,
        requiresLicensedPharmacy: rule.requiresLicensedPharmacy ?? false,
        escalationNote: rule.escalationNote ?? null,
      },
      create: {
        name: rule.name,
        condition: rule.condition,
        routine: rule.routine,
        ingredients: rule.ingredients,
        upsells: rule.upsells,
        followUpDays: rule.followUpDays,
        requiresLicensedPharmacy: rule.requiresLicensedPharmacy ?? false,
        escalationNote: rule.escalationNote ?? null,
      },
    });
  }
  console.log(`Seeded ${rules.length} real SkincareRule rows (replacing the old 5 dummy rules).`);

  console.log('Seed complete.');
  console.log('Super admin login:  admin@myglowback.ai / ChangeMe123!');
  console.log('Clinic admin login: admin@glowhausclinic.ng / ChangeMe123!');
  console.log('Staff login:        staff@glowhausclinic.ng / ChangeMe123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
