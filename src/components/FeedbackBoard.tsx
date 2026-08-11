'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { ChevronUp, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackItemData {
  id: string;
  title: string;
  description: string | null;
  status: 'OPEN' | 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'DECLINED';
  submittedByName: string;
  clinicName: string;
  createdAt: string;
  voteCount: number;
  votedByMe: boolean;
}

const STATUS_TONE: Record<FeedbackItemData['status'], 'sage' | 'honey' | 'danger' | 'neutral'> = {
  OPEN: 'neutral',
  PLANNED: 'honey',
  IN_PROGRESS: 'sage',
  DONE: 'sage',
  DECLINED: 'danger',
};

const STATUS_LABEL: Record<FeedbackItemData['status'], string> = {
  OPEN: 'Open',
  PLANNED: 'Planned',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
  DECLINED: 'Declined',
};

function VoteButton({ item, onToggle }: { item: FeedbackItemData; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex w-14 flex-none flex-col items-center gap-0.5 rounded-xl border py-2 transition-colors',
        item.votedByMe
          ? 'border-sage-500 bg-sage-50 text-sage-800'
          : 'border-clinical-border bg-white text-clinical-text hover:bg-ivory-100'
      )}
    >
      <ChevronUp size={16} />
      <span className="text-sm font-semibold">{item.voteCount}</span>
    </button>
  );
}

export function FeedbackBoard({ initialItems }: { initialItems: FeedbackItemData[] }) {
  const [items, setItems] = useState(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function toggleVote(id: string) {
    // Optimistic update — this is a low-stakes toggle, worth feeling instant.
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, votedByMe: !item.votedByMe, voteCount: item.voteCount + (item.votedByMe ? -1 : 1) }
            : item
        )
        .sort((a, b) => b.voteCount - a.voteCount)
    );
    await fetch(`/api/feedback/${id}/vote`, { method: 'POST' });
  }

  async function submit() {
    if (title.trim().length < 3) return;
    setSubmitting(true);
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: description || undefined }),
    });
    setSubmitting(false);
    if (res.ok) {
      // Simplest correct way to reflect the new item with real author/clinic
      // names attached — refetch rather than fabricate that data client-side.
      const listRes = await fetch('/api/feedback');
      const { items: fresh } = await listRes.json();
      setItems(fresh);
      setTitle('');
      setDescription('');
      setShowForm(false);
    }
  }

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Button type="button" variant="secondary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Suggest something
        </Button>
      ) : (
        <Card>
          <Label htmlFor="fb-title">What would help?</Label>
          <Input
            id="fb-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A short title"
          />
          <div className="mt-3">
            <Label htmlFor="fb-desc">More detail (optional)</Label>
            <Input
              id="fb-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What would this help with?"
            />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button type="button" onClick={submit} disabled={submitting || title.trim().length < 3}>
              {submitting ? 'Posting…' : 'Post'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-clinical-muted">
          Nothing here yet — be the first to suggest something.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="flex gap-4">
              <VoteButton item={item} onToggle={() => toggleVote(item.id)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-clinical-text">{item.title}</p>
                  <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
                </div>
                {item.description && (
                  <p className="mt-1 text-sm text-clinical-muted">{item.description}</p>
                )}
                <p className="mt-2 text-xs text-clinical-muted">
                  {item.submittedByName} · {item.clinicName}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
