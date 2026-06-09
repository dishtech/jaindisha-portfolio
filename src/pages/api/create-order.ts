export const prerender = false;
import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { getOffering } from '../../lib/offerings';
import { createOrder, isRazorpayConfigured, razorpayKeyId } from '../../lib/razorpay';
import { createPendingBooking } from '../../lib/bookings';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  if (!isRazorpayConfigured()) return json({ error: 'Payments are being set up' }, 503);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  const { sessionId, slotStart, name, email, phone, note } = body ?? {};
  const session = await getOffering(sessionId);
  if (!session) return json({ error: 'Unknown session' }, 400);
  if (!slotStart || !name || !email) return json({ error: 'Missing details' }, 400);

  try {
    // Amount comes from the server price source, NEVER the client.
    const receipt = `rcpt_${randomUUID().slice(0, 30)}`;
    const order = await createOrder(session.amountPaise, receipt, { sessionId, email });

    await createPendingBooking({
      orderId: order.id,
      sessionType: sessionId,
      amountPaise: session.amountPaise,
      clientName: name,
      clientEmail: email,
      clientPhone: phone || undefined,
      note: note || undefined,
      slotStart,
    });

    // key_id is public-safe; key_secret never leaves the server.
    return json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: razorpayKeyId() });
  } catch (e) {
    console.error('create-order error', e);
    return json({ error: 'Could not start payment' }, 500);
  }
};
