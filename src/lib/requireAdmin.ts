/**
 * Server-side admin guard. Reads the __session cookie, verifies it with the Admin SDK, then
 * resolves the email to a role (owner / super-admin / admin). Returns null if not an admin.
 * Use at the top of any protected SSR page / route.
 */
import type { AstroCookies } from 'astro';
import { adminAuth } from './firebaseAdmin';
import { resolveRole, type Role } from './roles';

export interface AdminSession {
  email: string;
  role: Role;
  uid: string;
}

export async function getAdmin(cookies: AstroCookies): Promise<AdminSession | null> {
  const cookie = cookies.get('__session')?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true); // checkRevoked
    const role = await resolveRole(decoded.email);
    if (!role) return null;
    return { email: (decoded.email || '').toLowerCase(), role, uid: decoded.uid };
  } catch {
    return null;
  }
}
