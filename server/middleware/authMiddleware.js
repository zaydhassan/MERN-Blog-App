const User = require("../models/userModel");
const { verifyAccessToken } = require("../utils/tokenUtils");

/**
 * Authenticate the request from a signed JWT.
 *
 * Reads `Authorization: Bearer <token>`, verifies the signature and expiry,
 * loads the user, and attaches it to `req.user`. This replaces the previous
 * scheme that trusted a raw `user-id` header (a full auth bypass).
 *
 * The password field has `select: false` on the model, so `req.user` never
 * contains the hash.
 */
exports.authenticateUser = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required." });
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Session expired. Please log in again."
          : "Invalid or malformed token.";
      return res.status(401).json({ success: false, message });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Authentication error." });
  }
};

/**
 * Soft authentication: if a valid Bearer token is present, populate `req.user`
 * and continue; if there is no token (or it's invalid), continue anyway with
 * `req.user` undefined. Used by public read routes that still want to attribute
 * activity (e.g. awarding readArticle points, deduping views) to logged-in
 * readers without locking anonymous visitors out.
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) return next();

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      // Invalid/expired token on a public route: don't 401, just treat as anon.
      return next();
    }

    const user = await User.findById(payload.sub);
    if (!user) return next();

    req.user = user;
    next();
  } catch {
    // Never fail the request over optional auth.
    next();
  }
};

// Admin-only gate.
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated." });
  }
  if (req.user.role !== "Admin") {
    return res
      .status(403)
      .json({ success: false, message: "Access denied. Admins only." });
  }
  next();
};

// Writer (or Admin) gate.
exports.isWriter = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated." });
  }
  if (req.user.role !== "Writer" && req.user.role !== "Admin") {
    return res
      .status(403)
      .json({ success: false, message: "Access denied. Writers only." });
  }
  next();
};

// Any authenticated user (Reader / Writer / Admin).
exports.isReader = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated." });
  }
  next();
};

/**
 * Ownership helper: ensures the authenticated user is acting on their own
 * resource, or is an Admin. Pass a function that resolves the resource's
 * owner id given the request (e.g. `req => Blog.findById(req.params.id)`).
 */
exports.requireOwnership = (resolveOwnerId) => async (req, res, next) => {
  try {
    if (req.user.role === "Admin") return next();

    const ownerId = await resolveOwnerId(req);
    if (!ownerId) {
      return res.status(404).json({ success: false, message: "Resource not found." });
    }
    if (String(ownerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not allowed." });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Authorization check failed." });
  }
};
