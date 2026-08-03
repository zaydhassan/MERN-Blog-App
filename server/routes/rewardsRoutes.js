const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const { getRewards, redeemReward } = require("../controllers/rewardsController");

// Reward catalog (GET /) is public so anyone can browse; redemption
// (POST /redeem) requires an authenticated session.
const router = express.Router();
router.get("/", getRewards);
router.post("/redeem", authenticateUser, redeemReward);

module.exports = router;