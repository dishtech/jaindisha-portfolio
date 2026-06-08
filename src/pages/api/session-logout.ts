export const prerender = false;
import type { APIRoute } from 'astro';
import { adminAuth } from '../../lib/firebaseAdmin';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const cookie = cookies.get('__session')?.value;
  if (cookie) {
    try {
      const decoded = await adminAuth.verifySessionCookie(cookie);
      await adminAuth.revokeRefreshTokens(decoded.sub);
    } catch {
      /* already invalid — ignore */
    }
  }
  cookies.delete('__session', { path: '/' });
  return redirect('/admin/login');
};
