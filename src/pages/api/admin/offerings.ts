export const prerender = false;
import type { APIRoute } from 'astro';
import { getAdmin } from '../../../lib/requireAdmin';
import { canEditContent } from '../../../lib/roles';
import { listAllOfferings, saveOffering, deleteOffering } from '../../../lib/offerings';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async ({ cookies }) => {
  const admin = await getAdmin(cookies);
  if (!admin || !canEditContent(admin.role)) return json({ error: 'Forbidden' }, 403);
  return json({ offerings: await listAllOfferings() });
};

export const POST: APIRoute = async ({ cookies, request }) => {
  const admin = await getAdmin(cookies);
  if (!admin || !canEditContent(admin.role)) return json({ error: 'Forbidden' }, 403);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  const { action, offering, id } = body ?? {};
  try {
    if (action === 'save') {
      const saved = await saveOffering(offering);
      return json({ ok: true, offering: saved });
    }
    if (action === 'delete') {
      await deleteOffering(id);
      return json({ ok: true });
    }
    return json({ error: 'Unknown action' }, 400);
  } catch (e: any) {
    return json({ error: e?.message || 'Could not save changes.' }, 400);
  }
};
