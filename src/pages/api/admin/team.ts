export const prerender = false;
import type { APIRoute } from 'astro';
import { getAdmin } from '../../../lib/requireAdmin';
import { listAdmins, addAdmin, removeAdmin, canManageUsers } from '../../../lib/roles';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async ({ cookies }) => {
  const admin = await getAdmin(cookies);
  if (!admin || !canManageUsers(admin.role)) return json({ error: 'Forbidden' }, 403);
  return json({ admins: await listAdmins() });
};

export const POST: APIRoute = async ({ cookies, request }) => {
  const admin = await getAdmin(cookies);
  if (!admin || !canManageUsers(admin.role)) return json({ error: 'Forbidden' }, 403);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  const { action, email, role } = body ?? {};
  try {
    if (action === 'add') {
      await addAdmin(email, role === 'super-admin' ? 'super-admin' : 'admin', admin.email);
    } else if (action === 'remove') {
      await removeAdmin(email, admin.email);
    } else {
      return json({ error: 'Unknown action' }, 400);
    }
    return json({ ok: true, admins: await listAdmins() });
  } catch (e: any) {
    return json({ error: e?.message || 'Could not update the team.' }, 400);
  }
};
