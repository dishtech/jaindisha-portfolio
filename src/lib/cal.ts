/**
 * Cal.com API v2 client (server-side only). Reads CALCOM_API_KEY + CAL_WEBHOOK_SECRET.
 * Each endpoint group pins its own cal-api-version header (verified June 2026):
 *   slots 2024-09-04 · bookings 2026-02-25 · webhooks 2024-08-13.
 */
import crypto from 'node:crypto';

const BASE = 'https://api.cal.com/v2';
export const TIMEZONE = 'Asia/Kolkata';

function headers(version: string): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.CALCOM_API_KEY ?? ''}`,
    'cal-api-version': version,
  };
}

export function isCalConfigured(): boolean {
  return Boolean(process.env.CALCOM_API_KEY);
}

export interface Slot {
  start: string; // ISO 8601 with offset, e.g. 2026-06-10T09:00:00.000+05:30
}

/** Open slots for an event type between start and end (ISO). Returns a flat, sorted list. */
export async function getSlots(eventTypeId: number, startISO: string, endISO: string): Promise<Slot[]> {
  const url =
    `${BASE}/slots?eventTypeId=${eventTypeId}` +
    `&start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}` +
    `&timeZone=${TIMEZONE}`;
  const res = await fetch(url, { headers: headers('2024-09-04') });
  if (!res.ok) throw new Error(`Cal.com slots error ${res.status}`);
  const json = (await res.json()) as { data?: Record<string, { start: string }[]> };
  const out: Slot[] = [];
  for (const day of Object.keys(json.data ?? {})) {
    for (const s of json.data![day]) out.push({ start: s.start });
  }
  out.sort((a, b) => a.start.localeCompare(b.start));
  return out;
}

export interface CreateBookingArgs {
  eventTypeId: number;
  start: string; // chosen slot start, ISO 8601
  name: string;
  email: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface CalBooking {
  uid: string;
  id: number;
  start: string;
  end: string;
  location?: string;
}

/** Create a real Cal.com booking (call only after payment is verified). */
export async function createBooking(args: CreateBookingArgs): Promise<CalBooking> {
  const res = await fetch(`${BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers('2026-02-25') },
    body: JSON.stringify({
      start: args.start,
      eventTypeId: args.eventTypeId,
      attendee: {
        name: args.name,
        email: args.email,
        timeZone: TIMEZONE,
        language: 'en',
        ...(args.phone ? { phoneNumber: args.phone } : {}),
      },
      ...(args.metadata ? { metadata: args.metadata } : {}),
    }),
  });
  const json = (await res.json()) as { data?: CalBooking; error?: unknown };
  if (!res.ok || !json.data) {
    throw new Error(`Cal.com booking failed (${res.status}): ${JSON.stringify(json.error ?? json)}`);
  }
  return json.data;
}

/** Verify a Cal.com webhook signature (x-cal-signature-256 = HMAC-SHA256 over the raw body). */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
