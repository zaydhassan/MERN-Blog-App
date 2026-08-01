const jwt = require("jsonwebtoken");

/**
 * Token + cookie helpers for JWT auth.
 *
 * Strategy:
 *  - Access token: short-lived (15m), returned in the JSON body, stored by
 *    the client and sent as `Authorization: Bearer <token>`.
 *  - Refresh token: long-lived (7d), kept in an httpOnly, Secure, SameSite
 *    cookie so client JS can never read it. Used by /refresh to mint new
 *    access tokens, and rotated on each refresh to detect reuse.
 */

const ACCESS_SECRET = process.env.JWT_SECRET;
// `isProduction` is derived solely from NODE_ENV. Previously this also accepted
// DEV_MODE, which meant an operator who forgot NODE_ENV in prod silently got
// insecure (non-secure) cookies.
const isProduction = process.env.NODE_ENV === "production";

// Refresh secret: in production it MUST be distinct from the access secret.
// If they were the same, a long-lived (7d) refresh token would also verify as
// an access token — collapsing the 15-minute access lifetime to a week and
// making a stolen refresh cookie as powerful as a permanent session. Fail
// fast in prod if it's missing; in dev, fall back to the access secret for
// convenience.
const REFRESH_SECRET = isProduction
  ? process.env.JWT_REFRESH_SECRET
  : process.env.JWT_REFRESH_SECRET || ACCESS_SECRET;

if (!ACCESS_SECRET) {
  // Fail fast if the secret is missing instead of silently signing with
  // `undefined` (which would let anyone forge tokens). Exiting (not just
  // logging) prevents the server from staying up and serving 500s with no
  // obvious cause — mirrors config/db.js's behavior on a missing MONGO_URL.
  console.error("FATAL: JWT_SECRET is not set. Authentication cannot be secured.");
  process.exit(1);
}
if (isProduction && !process.env.JWT_REFRESH_SECRET) {
  console.error("FATAL: JWT_REFRESH_SECRET must be set in production and differ from JWT_SECRET.");
  process.exit(1);
}

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

/**
 * Public, safe-to-send user fields. Never include the password hash.
 */
const publicUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  bio: user.bio,
  profile_image: user.profile_image,
  points: user.points,
  level: user.level,
  badges: user.badges,
});

const signAccessToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role, username: user.username },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );

const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString(), type: "refresh" }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });

const verifyAccessToken = (token) => {
  const payload = jwt.verify(token, ACCESS_SECRET);
  // Reject refresh tokens presented as access tokens. When the two secrets
  // happen to be the same (the dev fallback above), signature verification
  // alone would accept a refresh token here — which would let a 7-day cookie
  // authenticate as a 15-minute access token. The `type` claim is the guard.
  if (payload && payload.type === "refresh") {
    throw new jwt.JsonWebTokenError("refresh token is not a valid access token");
  }
  return payload;
};
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

/**
 * Cookie options for the refresh token. httpOnly + SameSite=Lax blocks
 * exfiltration via JS and mitigates CSRF for same-site deployments.
 * For cross-site (different domain) production, switch SameSite to "none"
 * with secure: true and add a CSRF token.
 */
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches REFRESH_EXPIRES_IN
  path: "/api/v1/user",
};

module.exports = {
  publicUser,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  refreshCookieOptions,
};