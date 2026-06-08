/**
 * Firebase Admin SDK (server-side ONLY) — initialized once as a singleton.
 *
 * Credentials come from EITHER:
 *   A) FIREBASE_SERVICE_ACCOUNT_B64  (base64 of the whole service-account JSON), OR
 *   B) FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (3 fields from the JSON)
 *
 * These are SECRETS. Never give them a PUBLIC_ prefix, and never import this into client code.
 * Only import from on-demand (prerender = false) routes, so it never runs at build time.
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

// Build the SDK once and cache it on globalThis. Astro/Vite dev re-evaluates this module on HMR,
// and db.settings() may be called only ONCE per Firestore instance — so guard it behind a cache
// that survives re-evaluation (harmless and idempotent in production too).
const globalForAdmin = globalThis as unknown as { __dishaAdmin?: { db: Firestore; auth: Auth } };

const sdk =
  globalForAdmin.__dishaAdmin ??
  (() => {
    const app = getApps().length ? getApp() : initializeApp({ credential: cert(serviceAccount()) });
    const firestore = getFirestore(app);
    try {
      firestore.settings({ ignoreUndefinedProperties: true });
    } catch {
      // settings() throws if already applied to this Firestore instance (e.g. an HMR re-eval
      // that reused an existing instance). The setting is already in effect, so this is safe.
    }
    return { db: firestore, auth: getAuth(app) };
  })();

globalForAdmin.__dishaAdmin = sdk;

export const db = sdk.db;
export const adminAuth = sdk.auth;
