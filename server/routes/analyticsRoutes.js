const express = require("express");
const { authenticateUser, isWriter } = require("../middleware/authMiddleware");
const { getAuthorStats } = require("../controllers/analyticsController");

// Writer-facing analytics. Only Writers (and Admins) reach this — readers have
// no authored posts to analyze.
const router = express.Router();
router.get("/", authenticateUser, isWriter, getAuthorStats);

module.exports = router;