/**
 * One-off: verifies the Admin SDK connects and creates the `bookings` collection
 * with a single clearly-marked sample document (safe to delete from the console).
 *
 * Run:  node --env-file=.env scripts/seed.mjs
 *
 * Reads credentials from the environment at runtime and never prints them.
 */
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function loadServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (b64) {
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }
  return null;
}

const sa = loadServiceAccount();
if (!sa) {
  console.error(
    '✗ No credentials. Set FIREBASE_SERVICE_ACCOUNT_B64, or FIREBASE_PROJECT_ID + ' +
      'FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in .env, then re-run.'
  );
  process.exit(1);
}

const app = getApps().length ? getApp() : initializeApp({ credential: cert(sa) });
const db = getFirestore(app);

try {
  const ref = await db.collection('bookings').add({
    clientName: 'Sample booking (safe to delete)',
    clientEmail: 'sample@example.com',
    sessionType: 'counselling',
    amountPaise: 99900,
    datetime: new Date().toISOString(),
    status: 'sample',
    createdAt: FieldValue.serverTimestamp(),
  });
  console.log('✓ Admin SDK connected. Created bookings/' + ref.id);
  console.log('  The `bookings` collection now exists. Delete that sample doc anytime from the console.');
  process.exit(0);
} catch (e) {
  console.error('✗ Firestore write failed:', e.message);
  process.exit(1);
}
