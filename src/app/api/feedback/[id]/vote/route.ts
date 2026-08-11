import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();

  const existing = await prisma.feedbackVote.findUnique({
    where: { feedbackItemId_userId: { feedbackItemId: params.id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.feedbackVote.delete({ where: { id: existing.id } });
    return NextResponse.json({ voted: false });
  }

  await prisma.feedbackVote.create({
    data: { feedbackItemId: params.id, userId: session.user.id },
  });
  return NextResponse.json({ voted: true });
}
