import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { addDays } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { TRIAL_LENGTH_DAYS } from '@/lib/date';
import { sendTrialWelcomeEmail } from '@/lib/email';

const bodySchema = z.object({
  clinicName: z.string().min(2),
  clinicEmail: z.string().email(),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  password: z.string().min(8),
  billingCycle: z.enum(['ANNUAL', 'MONTHLY']),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { clinicName, clinicEmail, adminName, adminEmail, password, billingCycle } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
  }

  // 14-day free trial — no invoice yet. billingCycle is just their stated
  // preference for whenever they do choose to pay (during or after trial).
  const subscriptionStart = new Date();
  const subscriptionEnd = addDays(subscriptionStart, TRIAL_LENGTH_DAYS);

  const result = await prisma.$transaction(async (tx) => {
    const clinic = await tx.clinic.create({
      data: {
        name: clinicName,
        email: clinicEmail,
        billingCycle,
        subscriptionStart,
        subscriptionEnd,
        isActive: true,
        isTrialing: true,
      },
    });

    await tx.location.create({
      data: {
        name: `${clinicName} — Main Location`,
        address: 'Update this in Dashboard → Locations',
        clinicId: clinic.id,
      },
    });

    const hashed = await bcrypt.hash(password, 10);
    const admin = await tx.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashed,
        role: 'CLINIC_ADMIN',
        clinicId: clinic.id,
      },
    });

    return { clinic, admin };
  });

  // Email failures shouldn't break signup — the trial is already active
  // either way, so this is a nice-to-have, not a blocker.
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    await sendTrialWelcomeEmail({
      to: adminEmail,
      clinicName,
      adminName,
      trialEndsAt: subscriptionEnd,
      loginUrl: `${appUrl}/login`,
    });
  } catch (err) {
    console.error('Welcome email failed to send:', err);
  }

  return NextResponse.json({
    ok: true,
    clinicId: result.clinic.id,
  });
}
