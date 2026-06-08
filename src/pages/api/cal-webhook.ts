export const prerender = false;
import type { APIRoute } from 'astro';
import { verifyWebhookSignature } from '../../lib/cal';
import { setStatusByCalUid, type BookingStatus } from '../../lib/bookings';

export const POST: APIRoute = async ({ request }) => {
  const raw = await request.text(); // raw body — needed for signature verification
  if (!verifyWebhookSignature(raw, request.headers.get('x-cal-signature-256'))) {
    return new Response('invalid signature', { status: 401 });
  }

  let evt: any;
  try {
    evt = JSON.parse(raw);
  } catch {
    return new Response('bad payload', { status: 400 });
  }

  // MEETING_* events are flat; others nest the booking under `payload`.
  const uid: string | undefined = evt.payload?.uid ?? evt.uid;
  const map: Record<string, BookingStatus> = {
    BOOKING_CANCELLED: 'cancelled',
    BOOKING_REJECTED: 'cancelled',
    MEETING_ENDED: 'completed',
  };
  const status = map[evt.triggerEvent as string];

  if (uid && status) {
    try {
      await setStatusByCalUid(uid, status);
    } catch (e) {
      console.error('cal-webhook update failed', e);
    }
  }
  return new Response('ok', { status: 200 });
};
