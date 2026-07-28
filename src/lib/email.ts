import nodemailer from 'nodemailer';

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 465),
    secure: true,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
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

  await getTransport().sendMail({
    from: process.env.EMAIL_FROM,
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

  await getTransport().sendMail({
    from: process.env.EMAIL_FROM,
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
}) {
  const { to, clinicName, daysUntilExpiry, renewUrl } = params;

  const html = `
  <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #2C2A24;">
    <h2 style="color: #374F39;">Hey ${clinicName} 🧴</h2>
    <p>Your MyGlowBack.AI subscription renews in <strong>${daysUntilExpiry} days</strong>.</p>
    <p>Click below to renew and keep your clinic running smoothly.</p>
    <a href="${renewUrl}"
       style="display:inline-block; background:#456348; color:#fff; padding:14px 28px;
              border-radius:999px; text-decoration:none; font-weight:600; margin-top:12px;">
      Pay Now →
    </a>
    <p style="margin-top: 24px; font-size: 13px; color: #6B6659;">
      If service lapses, your dashboard and public booking page will be paused until you renew.
    </p>
  </div>`;

  await getTransport().sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `⏳ Your MyGlowBack.AI subscription renews in ${daysUntilExpiry} days!`,
    html,
  });
}
