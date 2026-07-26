import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { addDays, addYears } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { PRICING } from '@/lib/paystack';

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

  const subscriptionStart = new Date();
  const subscriptionEnd =
    billingCycle === 'ANNUAL' ? addYears(subscriptionStart, 1) : addDays(subscriptionStart, 30);
  const amount = billingCycle === 'ANNUAL' ? PRICING.ANNUAL : PRICING.MONTHLY;

  const result = await prisma.$transaction(async (tx) => {
    const clinic = await tx.clinic.create({
      data: {
        name: clinicName,
        email: clinicEmail,
        billingCycle,
        subscriptionStart,
        subscriptionEnd,
        isActive: true, // access starts immediately; first invoice is generated UNPAID below
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

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber: `INV-${clinic.id.slice(-6).toUpperCase()}-${Date.now()}`,
        clinicId: clinic.id,
        amount,
        totalDue: amount,
        status: 'UNPAID',
        dueDate: subscriptionStart,
      },
    });

    return { clinic, admin, invoice };
  });

  return NextResponse.json({
    ok: true,
    clinicId: result.clinic.id,
    invoiceId: result.invoice.id,
  });
}
