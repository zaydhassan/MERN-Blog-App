const express = require("express");
<<<<<<< HEAD
const { toggleLike, getLikesByBlog } = require("../controllers/likeController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// Toggling a like requires authentication (the user is read from the token).
router.post("/toggle", authenticateUser, toggleLike);
// Reading likes is public.
=======
const { toggleLike, getLikesByBlog } = require("../controllers/likeController"); 

const router = express.Router();

router.post("/toggle", toggleLike); 
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
router.get("/:blogId", getLikesByBlog);

module.exports = router;