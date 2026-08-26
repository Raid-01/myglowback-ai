// Emits the contents of prisma/rules-data.ts as raw SQL, for pasting into
// Neon's SQL Editor directly — an alternative to `npx prisma db seed` for
// anyone on Render's free tier, where the Shell tab isn't available.
//
// Run with: npx tsx scripts/generate-seed-sql.ts > seed-rules.sql

import { rules } from '../prisma/rules-data';

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlJson(value: object): string {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function sqlTextArray(values: string[]): string {
  if (values.length === 0) return "ARRAY[]::text[]";
  return `ARRAY[${values.map(sqlString).join(', ')}]`;
}

const lines: string[] = [];
lines.push('-- Generated from prisma/rules-data.ts — do not edit by hand.');
lines.push('-- Paste this whole file into Neon\'s SQL Editor and run it.');
lines.push('-- Safe to re-run any time rules-data.ts changes: it upserts by');
lines.push('-- rule name, so existing rows get updated rather than duplicated.');
lines.push('');
lines.push('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
lines.push('');

for (const rule of rules) {
  const escalationNote = rule.escalationNote ? sqlString(rule.escalationNote) : 'NULL';
  const requiresLicensedPharmacy = rule.requiresLicensedPharmacy ? 'true' : 'false';
  const prescriptionOptions = sqlTextArray(rule.prescriptionOptions ?? []);

  lines.push(
    `INSERT INTO "SkincareRule" (id, name, condition, routine, ingredients, upsells, "followUpDays", "requiresLicensedPharmacy", "escalationNote", "prescriptionOptions", "createdAt", "updatedAt")`
  );
  lines.push(
    `VALUES (gen_random_uuid()::text, ${sqlString(rule.name)}, ${sqlJson(rule.condition)}, ${sqlJson(
      rule.routine
    )}, ${sqlTextArray(rule.ingredients)}, ${sqlTextArray(rule.upsells)}, ${rule.followUpDays}, ${requiresLicensedPharmacy}, ${escalationNote}, ${prescriptionOptions}, now(), now())`
  );
  lines.push(`ON CONFLICT ("name") DO UPDATE SET`);
  lines.push(`  condition = EXCLUDED.condition,`);
  lines.push(`  routine = EXCLUDED.routine,`);
  lines.push(`  ingredients = EXCLUDED.ingredients,`);
  lines.push(`  upsells = EXCLUDED.upsells,`);
  lines.push(`  "followUpDays" = EXCLUDED."followUpDays",`);
  lines.push(`  "requiresLicensedPharmacy" = EXCLUDED."requiresLicensedPharmacy",`);
  lines.push(`  "escalationNote" = EXCLUDED."escalationNote",`);
  lines.push(`  "prescriptionOptions" = EXCLUDED."prescriptionOptions",`);
  lines.push(`  "updatedAt" = now();`);
  lines.push('');
}

console.log(lines.join('\n'));
