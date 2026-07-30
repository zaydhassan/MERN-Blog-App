const express = require("express");
const { upload, validateImageFile } = require("../config/upload");
const validate = require("../middleware/validate");
const { authenticateUser, isAdmin } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  updateUser,
  uploadImage,
  getLeaderboard,
  getUserProfile,
  redeemPoints,
  listRewards,
} = require("../controllers/userController");
const { googleAuthController } = require("../controllers/oauthController");
const {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  updateUserSchema,
} = require("../validators/schemas");

const router = express.Router();

// ---- Public auth routes ----
router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
// Google (Firebase) OAuth token exchange — verifies the client's Firebase ID
// token and mints the app's own access + refresh JWTs (same shape as /login).
router.post("/google", validate(googleAuthSchema), googleAuthController);
router.post("/refresh", refreshTokenController);
router.post("/logout", logoutController);

// ---- Public read routes ----
router.get("/leaderboard", getLeaderboard);
router.get("/rewards", listRewards);
router.get("/:id", getUserProfile);

// ---- Authenticated routes ----
// Self-service profile update (ownership enforced in the controller).
router.put("/:userId", authenticateUser, validate(updateUserSchema), updateUser);
// Authenticated users may upload an avatar image. Shared upload config
// enforces the MIME allowlist + size cap; validateImageFile checks magic
// bytes after the file is written.
router.post(
  "/upload-image",
  authenticateUser,
  upload.single("image"),
  validateImageFile,
  uploadImage
);

// ---- Admin-only routes ----
// Listing all users is sensitive: without auth it leaked every user (and,
// before select:false, every password hash). Now it requires a valid Admin
// token.
router.get("/all-users", authenticateUser, isAdmin, getAllUsers);

// ---- Authenticated self-service routes ----
// Reward redemption acts on the *authenticated* user (the controller reads
// req.user._id and ignores any body userId). Point *earning* no longer has a
// client-triggered endpoint — it is awarded server-side inside the
// like / comment / publish flows (see utils/points.js), which closes the
// "spam update-points to farm unlimited points" abuse vector.
router.post("/rewards/redeem", authenticateUser, redeemPoints);

module.exports = router;