/**
 * Role-based access for /admin. Three roles:
 *   - owner       : Disha. From ALLOWED_ADMIN_EMAIL (env). All access + the ONLY one who can
 *                   add/remove admins. Permanent — can never be removed.
 *   - super-admin : sees everything (incl. earnings) and edits content, but cannot manage users.
 *   - admin       : edits content, but CANNOT see earnings, and cannot manage users.
 *
 * Owner lives in env (immutable root). Everyone else lives in the Firestore `admins` collection
 * (server-only; deny-all rules already cover it).
 */
import { db, adminAuth } from './firebaseAdmin';

export type Role = 'owner' | 'super-admin' | 'admin';

const norm = (e: string | null | undefined): string => (e || '').trim().toLowerCase();

export function rootEmail(): string {
  return norm(process.env.ALLOWED_ADMIN_EMAIL);
}

export interface AdminRecord {
  email: string;
  role: Role;
  root?: boolean; // the immutable owner
  addedBy?: string;
  createdAt?: number;
}

/** Resolve an email to its role, or null if it has no admin access. */
export async function resolveRole(email: string | null | undefined): Promise<Role | null> {
  const e = norm(email);
  if (!e) return null;
  if (e === rootEmail()) return 'owner';
  try {
    const doc = await db.collection('admins').doc(e).get();
    const data = doc.data();
    if (doc.exists && data?.active) {
      return data.role === 'super-admin' ? 'super-admin' : 'admin';
    }
  } catch (err) {
    console.error('resolveRole error', err);
  }
  return null;
}

/* ---- capability checks (single source of truth for what each role may do) ---- */
export const canSeeEarnings = (role: Role): boolean => role === 'owner' || role === 'super-admin';
export const canManageUsers = (role: Role): boolean => role === 'owner';
export const canEditContent = (_role: Role): boolean => true; // all three may edit content

/** Full team list: the owner (synthesized from env) plus every Firestore admin. */
export async function listAdmins(): Promise<AdminRecord[]> {
  const out: AdminRecord[] = [];
  const root = rootEmail();
  if (root) out.push({ email: root, role: 'owner', root: true });
  try {
    const snap = await db.collection('admins').get();
    snap.forEach((d) => {
      const data = d.data();
      if (norm(data.email) === root) return; // never duplicate the owner
      out.push({
        email: norm(data.email),
        role: data.role === 'super-admin' ? 'super-admin' : 'admin',
        addedBy: data.addedBy,
        createdAt: data.createdAt,
      });
    });
  } catch (e) {
    console.error('listAdmins error', e);
  }
  return out;
}

/** Add (or update the role of) an admin. Owner-only — caller must enforce. */
export async function addAdmin(email: string, role: 'super-admin' | 'admin', addedBy: string): Promise<void> {
  const e = norm(email);
  if (!e || !e.includes('@')) throw new Error('Please enter a valid email address.');
  if (e === rootEmail()) throw new Error('That email is the owner and already has full access.');
  await db.collection('admins').doc(e).set({
    email: e,
    role: role === 'super-admin' ? 'super-admin' : 'admin',
    active: true,
    addedBy: norm(addedBy),
    createdAt: Date.now(),
  });
}

/** Remove an admin. Owner-only — caller must enforce. Guards against removing the owner or self. */
export async function removeAdmin(email: string, requester: string): Promise<void> {
  const e = norm(email);
  if (e === rootEmail()) throw new Error('The owner cannot be removed.');
  if (e === norm(requester)) throw new Error('You cannot remove yourself.');
  await db.collection('admins').doc(e).delete();
  // Drop their active sessions immediately (their next request also fails the allowlist check).
  try {
    const user = await adminAuth.getUserByEmail(e);
    await adminAuth.revokeRefreshTokens(user.uid);
  } catch {
    /* user may not exist yet (never signed in) — nothing to revoke */
  }
}
