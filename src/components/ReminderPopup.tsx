'use client';

import { useEffect, useState } from 'react';

interface Props {
  notificationId: string;
  daysUntilExpiry: number;
}

const SNOOZE_HOURS = 24;

export function ReminderPopup({ notificationId, daysUntilExpiry }: Props) {
  const [visible, setVisible] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const snoozeKey = `mgb-reminder-snooze-${notificationId}`;

  useEffect(() => {
    const snoozedUntil = Number(localStorage.getItem(snoozeKey) ?? 0);
    if (Date.now() > snoozedUntil) setVisible(true);
  }, [snoozeKey]);

  if (!visible) return null;

  async function handleRemindLater() {
    // Notification.isSeen stays false in the DB (it's still an open renewal),
    // we just suppress the popup locally for 24 hours.
    localStorage.setItem(snoozeKey, String(Date.now() + SNOOZE_HOURS * 60 * 60 * 1000));
    setVisible(false);
  }

  async function handleRenewNow() {
    setRedirecting(true);
    await fetch(`/api/notifications/${notificationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isSeen: true }),
    });

    const res = await fetch('/api/paystack/initiate', { method: 'POST' });
    const data = await res.json();
    if (data.authorization_url) {
      window.location.href = data.authorization_url;
    } else {
      setRedirecting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-clinical-text/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-7 text-center shadow-soft">
        <h2 className="font-display text-xl font-medium text-clinical-text">
          Hey! Your subscription renews in {daysUntilExpiry} days 🧴
        </h2>
        <p className="mt-2 text-sm text-clinical-muted">
          Click below to renew and keep your clinic running smoothly.
        </p>

        <button
          onClick={handleRenewNow}
          disabled={redirecting}
          className="mt-6 w-full rounded-full bg-sage-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-700 disabled:opacity-60"
        >
          {redirecting ? 'Taking you to checkout…' : 'Renew Now →'}
        </button>

        <button
          onClick={handleRemindLater}
          className="mt-4 text-xs font-medium text-clinical-muted underline underline-offset-2"
        >
          Remind me later
        </button>
      </div>
    </div>
  );
}
