const express = require("express");
<<<<<<< HEAD
const commentController = require("../controllers/commentController");
const { authenticateUser, isAdmin } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { commentSchema } = require("../validators/schemas");

const router = express.Router();

// Admin-only moderation queue. MUST be mounted before GET /:blogId, otherwise
// "/reported" is captured by the /:blogId param route and never reaches this
// handler (the original route-shadowing bug).
router.get("/reported", authenticateUser, isAdmin, commentController.getReportedComments);

// Public read — anyone can view a blog's comments.
router.get("/:blogId", commentController.getCommentsByBlog);

// Authenticated writes. The author is derived from the token in each
// controller; client-supplied user ids are ignored.
router.post("/", authenticateUser, validate(commentSchema), commentController.createComment);
router.post("/reply", authenticateUser, commentController.addReply);
router.post("/report", authenticateUser, commentController.reportComment);
router.put("/:commentId", authenticateUser, commentController.updateComment);
router.delete("/:commentId", authenticateUser, commentController.deleteComment);

module.exports = router;
=======
const commentController = require("../controllers/commentController"); 

const router = express.Router();

router.post("/", commentController.createComment);
router.get("/:blogId", commentController.getCommentsByBlog);
router.put("/:commentId", commentController.updateComment);
router.delete("/:commentId", commentController.deleteComment);
router.post("/report", commentController.reportComment);
router.get("/reported", commentController.getReportedComments); 
router.post("/reply", commentController.addReply);

module.exports = router;
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
