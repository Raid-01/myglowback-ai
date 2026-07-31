// Email sending via Resend's HTTP API (not SMTP/Nodemailer).
//
// Render's free tier blocks outbound SMTP traffic (ports 25/465/587) as of
// September 2025 to prevent spam abuse — this is a platform-level network
// rule, not something wrong with credentials or code. Resend's REST API
// runs over regular HTTPS (port 443), which is never blocked, since
// blocking it would break the app's other web requests too (Paystack,
// etc.). Same email content as before, different transport underneath.

const RESEND_API_URL = 'https://api.resend.com/emails';

async function sendResendEmail(params: { to: string; subject: string; html: string }) {
  const apiKey = process.env.EMAIL_SERVER_PASSWORD; // holds the Resend API key
  if (!apiKey) throw new Error('EMAIL_SERVER_PASSWORD (Resend API key) is not set');

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      reply_to: process.env.EMAIL_REPLY_TO,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error: ${res.status} ${body}`);
  }
}

export async function sendTrialWelcomeEmail(params: {
  to: string;
  clinicName: string;
  adminName: string;
  trialEndsAt: Date;
  loginUrl: string;
}) {
  const { to, clinicName, adminName, trialEndsAt, loginUrl } = params;
  const trialEndFormatted = trialEndsAt.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const html = `
  <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #2C2A24;">
    <h2 style="color: #374F39;">Welcome, ${adminName} 🧴</h2>
    <p>${clinicName} is live on MyGlowBack.AI — you're all set to start matching patients to
    acne, hyperpigmentation, sun damage, and anti-aging routines right away.</p>
    <p><strong>You're on a free 14-day trial</strong>, no payment needed yet. Your trial runs
    through <strong>${trialEndFormatted}</strong> — add payment anytime before then to keep
    access without interruption.</p>
    <a href="${loginUrl}"
       style="display:inline-block; background:#456348; color:#fff; padding:14px 28px;
              border-radius:999px; text-decoration:none; font-weight:600; margin-top:12px;">
      Go to your dashboard →
    </a>
    <p style="margin-top: 24px; font-size: 13px; color: #6B6659;">
      Questions along the way? Just reply to this email.
    </p>
  </div>`;

  await sendResendEmail({
    to,
    subject: `Welcome to MyGlowBack.AI — your 14-day trial has started`,
    html,
  });
}

export async function sendPaymentConfirmedEmail(params: {
  to: string;
  clinicName: string;
  amount: number;
  billingCycle: 'ANNUAL' | 'MONTHLY';
  newSubscriptionEnd: Date;
}) {
  const { to, clinicName, amount, billingCycle, newSubscriptionEnd } = params;
  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
  const nextRenewalFormatted = newSubscriptionEnd.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const html = `
  <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #2C2A24;">
    <h2 style="color: #374F39;">You're all set, ${clinicName} 🎉</h2>
    <p>We've received your payment of <strong>${formattedAmount}</strong>
    (${billingCycle === 'ANNUAL' ? 'annual' : 'monthly'} plan).</p>
    <p>Your subscription is active through <strong>${nextRenewalFormatted}</strong>. Thanks for
    trusting MyGlowBack.AI with your clinic.</p>
  </div>`;

  await sendResendEmail({
    to,
    subject: `Payment received — welcome to MyGlowBack.AI`,
    html,
  });
}

export async function sendRenewalReminderEmail(params: {
  to: string;
  clinicName: string;
  daysUntilExpiry: number;
  renewUrl: string;
  isTrialing: boolean;
}) {
  const { to, clinicName, daysUntilExpiry, renewUrl, isTrialing } = params;

  const headline = isTrialing
    ? `Your free trial ends in <strong>${daysUntilExpiry} days</strong>.`
    : `Your MyGlowBack.AI subscription renews in <strong>${daysUntilExpiry} days</strong>.`;
  const body = isTrialing
    ? 'Add payment before then to keep your clinic running without interruption.'
    : 'Click below to renew and keep your clinic running smoothly.';
  const buttonLabel = isTrialing ? 'Add Payment →' : 'Pay Now →';

  const html = `
  <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #2C2A24;">
    <h2 style="color: #374F39;">Hey ${clinicName} 🧴</h2>
    <p>${headline}</p>
    <p>${body}</p>
    <a href="${renewUrl}"
       style="display:inline-block; background:#456348; color:#fff; padding:14px 28px;
              border-radius:999px; text-decoration:none; font-weight:600; margin-top:12px;">
      ${buttonLabel}
    </a>
    <p style="margin-top: 24px; font-size: 13px; color: #6B6659;">
      If service lapses, your dashboard and public booking page will be paused until you renew.
    </p>
  </div>`;

  await sendResendEmail({
    to,
    subject: isTrialing
      ? `⏳ Your MyGlowBack.AI free trial ends in ${daysUntilExpiry} days!`
      : `⏳ Your MyGlowBack.AI subscription renews in ${daysUntilExpiry} days!`,
    html,
  });
}
