import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';

export async function GET() {
  const session = await requireSession();

  const items = await prisma.feedbackItem.findMany({
    include: {
      submittedBy: { select: { name: true } },
      clinic: { select: { name: true } },
      votes: { select: { userId: true } },
    },
  });

  // Sorted by vote count in JS rather than the DB, since Prisma can't order
  // by a relation's count directly without a raw query — fine at this scale.
  const sorted = items
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      submittedByName: item.submittedBy.name,
      clinicName: item.clinic.name,
      createdAt: item.createdAt,
      voteCount: item.votes.length,
      votedByMe: item.votes.some((v) => v.userId === session.user.id),
    }))
    .sort((a, b) => b.voteCount - a.voteCount);

  return NextResponse.json({ items: sorted });
}

const bodySchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session.user.clinicId) {
    return NextResponse.json({ error: 'No clinic on this account.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.feedbackItem.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      submittedById: session.user.id,
      clinicId: session.user.clinicId,
    },
  });

  return NextResponse.json({ id: item.id });
}
