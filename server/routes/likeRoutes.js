const express = require("express");
const { toggleLike, getLikesByBlog } = require("../controllers/likeController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// Toggling a like requires authentication (the user is read from the token).
router.post("/toggle", authenticateUser, toggleLike);
// Reading likes is public.
router.get("/:blogId", getLikesByBlog);

module.exports = router;