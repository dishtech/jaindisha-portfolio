/**
 * Razorpay server helpers. Reads RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET (server-only).
 * key_id is public-safe and is handed to the browser via the create-order response;
 * key_secret never leaves the server.
 */
import Razorpay from 'razorpay';
import crypto from 'node:crypto';

/** key_id is public-safe, so accept it under RAZORPAY_KEY_ID or the PUBLIC_ alias. */
export function razorpayKeyId(): string | undefined {
  return process.env.RAZORPAY_KEY_ID || process.env.PUBLIC_RAZORPAY_KEY_ID;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(razorpayKeyId() && process.env.RAZORPAY_KEY_SECRET);
}

let client: Razorpay | null = null;
function rzp(): Razorpay {
  if (!client) {
    client = new Razorpay({
      key_id: razorpayKeyId()!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return client;
}

/** Create a one-time INR order. amountPaise must be an integer (₹999 -> 99900). */
export async function createOrder(amountPaise: number, receipt: string, notes: Record<string, string>) {
  return rzp().orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
    payment_capture: true,
    notes,
  });
}

function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

/** Verify the checkout payment signature: HMAC-SHA256(order_id + "|" + payment_id, key_secret), hex. */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  return safeEqualHex(expected, signature);
}

/** Verify a Razorpay webhook signature (x-razorpay-signature over the raw body). */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeEqualHex(expected, signature);
}
