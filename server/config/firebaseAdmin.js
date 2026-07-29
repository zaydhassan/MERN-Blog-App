// Server-side Firebase Admin SDK — used only to verify the Firebase ID tokens
// the client obtains via signInWithPopup (Google). Verified tokens are then
// exchanged for the app's own JWTs in oauthController.
//
// firebase-admin v14 uses the modular subpath API (firebase-admin/app,
// firebase-admin/auth); the legacy `admin.apps` / `admin.auth()` namespace no
// longer exists.
//
// Credentials, in priority order:
//   1. FIREBASE_SERVICE_ACCOUNT env var — the full service-account JSON as a
//      single line (Project settings → Service accounts → Generate new key).
//   2. GOOGLE_APPLICATION_CREDENTIALS env var pointing to that JSON file, via
//      applicationDefault() (works on GCP/CI hosts too).
//
// If neither is set, we don't crash the server — we export a null auth instance
// and a `firebaseAuthReady = false` flag so the /google endpoint can return a
// clean 503. Email/password auth still works.

const { initializeApp, getApps, cert, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

let firebaseAuthReady = false;
let authInstance = null;

function init() {
  if (getApps().length) {
    authInstance = getAuth();
    firebaseAuthReady = true;
    return;
  }

  try {
    let credential;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Explicit file path (works on GCP/CI too). We intentionally do NOT fall
      // back to ambient ADC, so the endpoint returns a clean 503 until the
      // operator has explicitly configured Firebase — rather than silently
      // using a wrong-project credential picked up from the environment.
      credential = applicationDefault();
    } else {
      throw new Error("No Firebase credentials configured (set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS).");
    }
    const app = initializeApp({ credential });
    authInstance = getAuth(app);
    firebaseAuthReady = true;
  } catch (err) {
    firebaseAuthReady = false;
    authInstance = null;
    console.warn(
      "[firebase-admin] Not initialized — Google sign-in will return 503. " +
        "Set FIREBASE_SERVICE_ACCOUNT (service-account JSON) or " +
        `GOOGLE_APPLICATION_CREDENTIALS (file path). (${err.message || err})`
    );
  }
}

init();

// Returns the Auth instance only when ready; callers check isFirebaseAuthReady()
// (or just null-check the return) before using it.
const getAuthInstance = () => (firebaseAuthReady ? authInstance : null);
const isFirebaseAuthReady = () => firebaseAuthReady;

module.exports = { getAuthInstance, isFirebaseAuthReady };