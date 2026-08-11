import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { FeedbackBoard } from '@/components/FeedbackBoard';

export default async function FeedbackPage() {
  const session = await requireSession();

  const items = await prisma.feedbackItem.findMany({
    include: {
      submittedBy: { select: { name: true } },
      clinic: { select: { name: true } },
      votes: { select: { userId: true } },
    },
  });

  const sorted = items
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      submittedByName: item.submittedBy.name,
      clinicName: item.clinic.name,
      createdAt: item.createdAt.toISOString(),
      voteCount: item.votes.length,
      votedByMe: item.votes.some((v) => v.userId === session.user.id),
    }))
    .sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-medium text-clinical-text">Feedback & Feature Requests</h1>
      <p className="mt-1 text-sm text-clinical-muted">
        Seen by every clinic using MyGlowBack.AI — vote on what matters most to you, or add something new.
      </p>
      <div className="mt-6">
        <FeedbackBoard initialItems={sorted} />
      </div>
    </div>
  );
}
