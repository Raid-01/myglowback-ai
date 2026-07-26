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
