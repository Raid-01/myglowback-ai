import crypto from 'crypto';

const PAYSTACK_BASE = 'https://api.paystack.co';

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not set');
  return key;
}

export const PRICING = {
  ANNUAL: 450_000,
  MONTHLY: 55_000,
} as const;

interface InitializeParams {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}

/** Kicks off a Paystack checkout and returns the authorization_url to redirect to. */
export async function initializeTransaction(params: InitializeParams) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo, // Paystack expects the smallest currency unit (kobo)
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack initialize failed: ${res.status} ${body}`);
  }

  return res.json() as Promise<{
    status: boolean;
    data: { authorization_url: string; access_code: string; reference: string };
  }>;
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack verify failed: ${res.status} ${body}`);
  }

  return res.json() as Promise<{
    status: boolean;
    data: { status: string; amount: number; reference: string; metadata: Record<string, unknown> };
  }>;
}

/** Validates the x-paystack-signature header on incoming webhook requests. */
export function isValidPaystackSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const hash = crypto.createHmac('sha512', secretKey()).update(rawBody).digest('hex');
  return hash === signatureHeader;
}

export function naira(amount: number): number {
  return amount * 100; // to kobo
}
