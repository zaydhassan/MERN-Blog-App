const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const {
  toggleFollow,
  getFollowInfo,
  listFollowers,
  listFollowing,
} = require("../controllers/followController");

const router = express.Router();

// All follow routes are authenticated (the follower is req.user._id).
// Toggle follow on/off (idempotent).
router.post("/:userId", authenticateUser, toggleFollow);
// Counts + "am I following this user" for the Follow button.
router.get("/info/:userId", authenticateUser, getFollowInfo);
// Public-ish lists (auth required to know "me", but the lists themselves are
// the target's, not the caller's).
router.get("/followers/:userId", authenticateUser, listFollowers);
router.get("/following/:userId", authenticateUser, listFollowing);

module.exports = router;