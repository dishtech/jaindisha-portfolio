export const prerender = false;
import type { APIRoute } from 'astro';
import { verifyWebhookSignature } from '../../lib/razorpay';
import { db } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// Backup source of truth for payment capture, independent of the browser callback.
export const POST: APIRoute = async ({ request }) => {
  const raw = await request.text(); // raw body — needed for signature verification
  if (!verifyWebhookSignature(raw, request.headers.get('x-razorpay-signature'))) {
    return new Response('invalid signature', { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response('bad payload', { status: 400 });
  }

  if (event.event === 'payment.captured') {
    const p = event.payload?.payment?.entity;
    if (p?.order_id) {
      try {
        // Idempotent: keyed by order id, merge only.
        await db.collection('bookings').doc(p.order_id).set(
          { razorpayPaymentId: p.id, paidViaWebhookAt: FieldValue.serverTimestamp() },
          { merge: true }
        );
      } catch (e) {
        console.error('razorpay-webhook update failed', e);
      }
    }
  }
  return new Response('ok', { status: 200 }); // respond 200 fast to avoid retries
};
