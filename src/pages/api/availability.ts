export const prerender = false;
import type { APIRoute } from 'astro';
import { getOffering } from '../../lib/offerings';
import { getSlots, isCalConfigured } from '../../lib/cal';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async ({ url }) => {
  const sessionId = url.searchParams.get('sessionId') ?? '';
  const session = await getOffering(sessionId);
  if (!session) return json({ error: 'Unknown session' }, 400);

  // Booking not wired up yet (no Cal.com key, or this session has no event type).
  if (!isCalConfigured() || session.calEventTypeId == null) {
    return json({ configured: false });
  }

  try {
    const start = new Date().toISOString();
    const end = new Date(Date.now() + 14 * 86_400_000).toISOString();
    const slots = await getSlots(session.calEventTypeId, start, end);
    return json({ configured: true, slots });
  } catch (e) {
    console.error('availability error', e);
    return json({ error: 'Could not load availability' }, 502);
  }
};
