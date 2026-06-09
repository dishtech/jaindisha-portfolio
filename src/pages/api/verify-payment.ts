export const prerender = false;
import type { APIRoute } from 'astro';
import { verifyPaymentSignature } from '../../lib/razorpay';
import { getBooking, confirmBooking, markFailed } from '../../lib/bookings';
import { getOffering } from '../../lib/offerings';
import { createBooking, isCalConfigured } from '../../lib/cal';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return json({ ok: false }, 400);

  // 1. Verify the payment signature server-side. A forged client "success" is rejected here.
  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    await markFailed(razorpay_order_id, 'signature_mismatch');
    return json({ ok: false, error: 'Payment could not be verified' }, 400);
  }

  const booking = await getBooking(razorpay_order_id);
  if (!booking) return json({ ok: false, error: 'Booking not found' }, 404);

  const session = await getOffering(booking.sessionType);

  // 2. Payment is genuine. Create the Cal.com booking, then finalize Firestore.
  try {
    if (isCalConfigured() && session?.calEventTypeId != null) {
      const cal = await createBooking({
        eventTypeId: session.calEventTypeId,
        start: booking.slotStart,
        name: booking.clientName,
        email: booking.clientEmail,
        phone: booking.clientPhone,
        metadata: { orderId: razorpay_order_id, paymentId: razorpay_payment_id },
      });
      await confirmBooking(razorpay_order_id, {
        razorpayPaymentId: razorpay_payment_id,
        calBookingUid: cal.uid,
        calBookingId: cal.id,
      });
      return json({ ok: true, location: cal.location ?? null });
    }
    // Cal.com not wired for this session: payment is recorded; Disha schedules manually.
    await confirmBooking(razorpay_order_id, { razorpayPaymentId: razorpay_payment_id });
    return json({ ok: true, location: null });
  } catch (e) {
    // Paid, but the calendar booking failed. Keep the payment on record for follow-up.
    console.error('cal booking after payment failed', e);
    await confirmBooking(razorpay_order_id, { razorpayPaymentId: razorpay_payment_id });
    return json({ ok: true, location: null, scheduling: 'pending' });
  }
};
