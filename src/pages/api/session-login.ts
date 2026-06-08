export const prerender = false;
import type { APIRoute } from 'astro';
import { adminAuth } from '../../lib/firebaseAdmin';
import { resolveRole } from '../../lib/roles';

const EXPIRES_IN_MS = 60 * 60 * 24 * 14 * 1000; // 14 days (Firebase max)

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { idToken } = await request.json();
    if (!idToken) return new Response('Missing token', { status: 400 });

    const decoded = await adminAuth.verifyIdToken(idToken, true);

    // Allowlist gate: owner (env) or an active entry in the admins collection.
    const role = await resolveRole(decoded.email);
    if (!role) return new Response('Forbidden', { status: 403 });

    // Require a recent sign-in (mitigates stolen long-lived tokens).
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
      return new Response('Please sign in again', { status: 401 });
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN_MS });
    cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: import.meta.env.PROD, // allows http on `netlify dev`/localhost
      sameSite: 'strict',
      path: '/',
      maxAge: EXPIRES_IN_MS / 1000, // Astro maxAge is in SECONDS; Firebase expiresIn is ms
    });
    return new Response(JSON.stringify({ status: 'ok' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }
};
