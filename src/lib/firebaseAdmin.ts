/**
 * Firebase Admin SDK (server-side ONLY) — initialized LAZILY on first real use.
 *
 * Credentials come from EITHER:
 *   A) FIREBASE_SERVICE_ACCOUNT_B64  (base64 of the whole service-account JSON), OR
 *   B) FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (3 fields from the JSON)
 *
 * These are SECRETS. Never give them a PUBLIC_ prefix, and never import this into client code.
 *
 * Why lazy: `db`/`adminAuth` are Proxies that only initialize on first property access (e.g.
 * db.collection(...)), NOT at import. So a module that merely imports `db` — like the SSR homepage
 * via offerings.ts — won't crash at load when creds are absent. Callers that wrap usage in
 * try/catch (getOfferings, listBookings, the auth guard) then degrade gracefully to fallbacks.
 */
import { initializeApp, getApps, getApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

function serviceAccount(): ServiceAccount {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (b64) {
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8')) as ServiceAccount;
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }
  throw new Error(
    'Firebase admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_B64, or ' +
      'FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY. See .env.example.'
  );
}

interface Sdk {
  db: Firestore;
  auth: Auth;
}

/** Build (once) and cache the SDK on globalThis so it survives Astro/Vite HMR re-evaluation. */
function sdk(): Sdk {
  const g = globalThis as unknown as { __dishaAdmin?: Sdk };
  if (g.__dishaAdmin) return g.__dishaAdmin;
  const app = getApps().length ? getApp() : initializeApp({ credential: cert(serviceAccount()) });
  const firestore = getFirestore(app);
  try {
    firestore.settings({ ignoreUndefinedProperties: true });
  } catch {
    // settings() throws if already applied to this instance (HMR reuse) — safe to ignore.
  }
  g.__dishaAdmin = { db: firestore, auth: getAuth(app) };
  return g.__dishaAdmin;
}

/** A Proxy that initializes the SDK only when a property is actually accessed. */
function lazy<T extends object>(pick: (s: Sdk) => T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const real = pick(sdk()) as Record<string | symbol, unknown>;
      const value = real[prop];
      return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(real) : value;
    },
  });
}

export const db: Firestore = lazy((s) => s.db);
export const adminAuth: Auth = lazy((s) => s.auth);
