/**
 * Browser-only Firebase client (admin login). Uses ONLY PUBLIC_ env vars.
 * The web apiKey is not a secret — real security is the server-side session
 * verification + the ALLOWED_ADMIN_EMAIL check.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const app = getApps().length
  ? getApp()
  : initializeApp({
      apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
      authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
      appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
    });

export const auth = getAuth(app);
