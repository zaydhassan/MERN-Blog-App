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
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || ACCESS_SECRET;

if (!ACCESS_SECRET) {
  // Fail fast in dev if the secret is missing instead of silently signing
  // with `undefined` (which would let anyone forge tokens).
  console.error("FATAL: JWT_SECRET is not set. Authentication cannot be secured.");
}

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const isProduction = process.env.NODE_ENV === "production" || process.env.DEV_MODE === "production";

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

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);
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