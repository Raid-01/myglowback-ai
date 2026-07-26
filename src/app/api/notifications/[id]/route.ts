import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  const body = await req.json();

  const notification = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!notification || notification.clinicId !== session.user.clinicId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const updated = await prisma.notification.update({
    where: { id: params.id },
    data: { isSeen: Boolean(body.isSeen) },
  });

  return NextResponse.json(updated);
}
