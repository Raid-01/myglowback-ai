import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

const bodySchema = z.object({
  licenseType: z.enum(['PHARMACY', 'AESTHETIC_OR_MERCHANT']),
  professionalLicenseNumber: z.string().nullable(),
  verified: z.boolean(), // false clears licenseVerifiedAt regardless of type
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireRole(['SUPER_ADMIN']);

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const clinic = await prisma.clinic.update({
    where: { id: params.id },
    data: {
      licenseType: parsed.data.licenseType,
      professionalLicenseNumber: parsed.data.professionalLicenseNumber,
      // Self-declaring PHARMACY never verifies on its own — verified is a
      // deliberate, separate Super Admin action, checked against the real
      // license number above before flipping this on.
      licenseVerifiedAt: parsed.data.verified ? new Date() : null,
      licenseVerifiedByEmail: parsed.data.verified ? session.user.email : null,
    },
  });

  return NextResponse.json({
    licenseType: clinic.licenseType,
    licenseVerifiedAt: clinic.licenseVerifiedAt,
  });
}
