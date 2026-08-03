const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const { getWritingStats, setDailyGoal } = require("../controllers/writingController");

const router = express.Router();

// All writing routes are self-service (operate on req.user._id).
router.get("/stats", authenticateUser, getWritingStats);
router.put("/goal", authenticateUser, setDailyGoal);

module.exports = router;