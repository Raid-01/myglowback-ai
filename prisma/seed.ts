import { PrismaClient, Role, BillingCycle, SkinType, Concern } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { rules } from './rules-data';

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
        prescriptionOptions: rule.prescriptionOptions ?? [],
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
        prescriptionOptions: rule.prescriptionOptions ?? [],
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
