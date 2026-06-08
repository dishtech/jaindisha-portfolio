/**
 * The `bookings` collection: data model + server-side helpers (Admin SDK).
 * Documents are keyed by the Razorpay order id so create-order, verify-payment,
 * and webhooks all reference the same record. All access is server-only.
 *
 * Lifecycle: created (order made) -> scheduled (paid + Cal.com booked)
 *            -> completed / cancelled. failed = payment/signature problem.
 */
import { FieldValue, type Timestamp } from 'firebase-admin/firestore';
import { db } from './firebaseAdmin';

export type BookingStatus = 'created' | 'scheduled' | 'completed' | 'cancelled' | 'failed';

export interface PendingBooking {
  orderId: string;
  sessionType: string; // a key in src/data/sessions.ts
  amountPaise: number; // priced server-side, never from the client
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  note?: string;
  slotStart: string; // ISO timestamp of the chosen slot
}

export interface Booking extends PendingBooking {
  id: string;
  status: BookingStatus;
  currency: 'INR';
  razorpayPaymentId?: string;
  calBookingUid?: string;
  calBookingId?: number;
  createdAt?: Timestamp;
}

const COLLECTION = 'bookings';

/** Write a pending booking when the order is created. */
export async function createPendingBooking(b: PendingBooking): Promise<void> {
  await db.collection(COLLECTION).doc(b.orderId).set({
    ...b,
    currency: 'INR',
    status: 'created' as BookingStatus,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function getBooking(orderId: string): Promise<Booking | null> {
  const snap = await db.collection(COLLECTION).doc(orderId).get();
  return snap.exists ? ({ id: snap.id, ...(snap.data() as Omit<Booking, 'id'>) }) : null;
}

/** After payment + Cal.com booking succeed, mark scheduled and store references. */
export async function confirmBooking(
  orderId: string,
  fields: { razorpayPaymentId: string; calBookingUid?: string; calBookingId?: number }
): Promise<void> {
  await db.collection(COLLECTION).doc(orderId).set(
    { ...fields, status: 'scheduled' as BookingStatus, confirmedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
}

export async function markFailed(orderId: string, reason: string): Promise<void> {
  await db.collection(COLLECTION).doc(orderId).set(
    { status: 'failed' as BookingStatus, failReason: reason },
    { merge: true }
  );
}

/** All bookings, newest first (admin dashboard). */
export async function listBookings(): Promise<Booking[]> {
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, 'id'>) }));
}

/** Update status by Cal.com booking uid (for Cal.com webhooks). */
export async function setStatusByCalUid(calBookingUid: string, status: BookingStatus): Promise<void> {
  const snap = await db.collection(COLLECTION).where('calBookingUid', '==', calBookingUid).limit(1).get();
  if (!snap.empty) await snap.docs[0].ref.update({ status });
}
