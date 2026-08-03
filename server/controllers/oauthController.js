// Google (Firebase) OAuth token-exchange endpoint. The client obtains a
// Firebase ID token via signInWithPopup and posts it here; we verify it with
// the Firebase Admin SDK, find-or-create the user, then mint the app's own
// access + refresh JWTs — identical shape to loginController so the client's
// success branch is reused verbatim.

const userModel = require("../models/userModel");
const { getAuthInstance } = require("../config/firebaseAdmin");
const {
  publicUser,
  signAccessToken,
  signRefreshToken,
  refreshCookieOptions,
} = require("../utils/tokenUtils");

// Build a username that satisfies userModel's unique + charset constraints.
// Sanitize the Google display name; fall back to the email local-part; ensure
// uniqueness with an incrementing suffix. `attempt` lets us retry on a 11000
// race without re-querying the original base.
const USERNAME_RE = /^[a-zA-Z0-9_ -]+$/;

const generateUsername = async (name, email) => {
  const localPart = (email || "").split("@")[0] || "";
  const fromName =
    (name || "").trim().replace(/\s+/g, " ").match(USERNAME_RE)
      ? (name || "").trim().replace(/\s+/g, " ").slice(0, 24)
      : "";
  let base = fromName || localPart.replace(/[^a-zA-Z0-9_ -]/g, "").slice(0, 24) || "writer";

  let candidate = base;
  let i = 1;
  // Bounded loop — a collision after 50 tries is effectively impossible.
  while (i < 50) {
    const existing = await userModel.findOne({ username: candidate });
    if (!existing) return candidate;
    candidate = `${base}${i}`.slice(0, 30);
    i += 1;
  }
  // Absolute fallback — random-ish suffix via time + random (Math.random is
  // fine here; this runs server-side, not in a workflow sandbox).
  return `${base}${Date.now() % 100000}`.slice(0, 30);
};

exports.googleAuthController = async (req, res) => {
  const auth = getAuthInstance();
  if (!auth) {
    return res
      .status(503)
      .json({ success: false, message: "Google sign-in is not configured on the server." });
  }

  const { idToken } = req.body;

  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired Google token." });
  }

  const email = decoded.email ? decoded.email.toLowerCase() : null;
  if (!email || decoded.email_verified !== true) {
    return res
      .status(400)
      .json({ success: false, message: "Google account email could not be verified." });
  }

  try {
    let user = await userModel.findOne({ email });

    if (user) {
      // Pre-registration takeover guard: if an account already exists for this
      // email AND has a password we didn't issue, do NOT silently link the
      // Google identity to it. Otherwise an attacker could register
      // victim@gmail.com with their own password, then "log in with Google"
      // to take over the victim's email-backed account. (Password signup has
      // no email-verification step today, so we can't trust that a
      // password-account owner controls the email.) We only auto-link when
      // the existing account is itself OAuth-only (no password) — i.e. a
      // Google-created account returning via Google.
      if (user.password) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists. Log in with your password instead, or reset it if it's yours.",
        });
      }

      let changed = false;
      if (!user.provider) {
        user.provider = "google";
        changed = true;
      }
      if (!user.providerId) {
        user.providerId = decoded.user_id || decoded.uid || null;
        changed = true;
      }
      if (!user.profile_image && decoded.picture) {
        user.profile_image = decoded.picture;
        changed = true;
      }
      if (changed) await user.save();
    } else {
      // New OAuth-only account — no password.
      const username = await generateUsername(decoded.name, email);
      try {
        user = await userModel.create({
          username,
          email,
          role: "Reader",
          provider: "google",
          providerId: decoded.user_id || decoded.uid || null,
          profile_image: decoded.picture || "",
        });
      } catch (createErr) {
        // Username collision race — regenerate once with a time-based suffix.
        if (createErr.code === 11000) {
          const username = `${(decoded.name || email.split("@")[0] || "writer")
            .replace(/[^a-zA-Z0-9_ -]/g, "")
            .slice(0, 20)}${Date.now() % 100000}`.slice(0, 30) || "writer";
          user = await userModel.create({
            username,
            email,
            role: "Reader",
            provider: "google",
            providerId: decoded.user_id || decoded.uid || null,
            profile_image: decoded.picture || "",
          });
        } else {
          throw createErr;
        }
      }
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: publicUser(user),
      accessToken,
    });
  } catch (error) {
    console.error("Google auth error:", error.message);
    return res.status(500).json({ success: false, message: "Error during Google sign-in." });
  }
};