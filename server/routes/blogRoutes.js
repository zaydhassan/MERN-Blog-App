const express = require("express");
const { upload, validateImageFile } = require("../config/upload");
const validate = require("../middleware/validate");
const { authenticateUser, isWriter, optionalAuth } = require("../middleware/authMiddleware");
const { blogCreateSchema, blogUpdateSchema } = require("../validators/schemas");
const {
  getAllBlogsController,
  createBlogController,
  updateBlogController,
  getBlogByIdController,
  deleteBlogController,
  userBlogController,
  getUserDrafts,
  getTrendingBlogs,
  getRecommendedBlogs,
  getBlogsByCategory,
  getBlogsByTag,
  getRelatedBlogs,
} = require("../controllers/blogController");
const {
  listRevisions,
  createRevision,
  deleteRevision,
} = require("../controllers/blogRevisionController");

const router = express.Router();

// ---- Public read routes (anyone can browse/read) ----
router.get("/all-blog", getAllBlogsController);
router.get("/trending", getTrendingBlogs);
router.get("/category/:category", getBlogsByCategory);
router.get("/tag/:tagId", getBlogsByTag);
router.get("/related/:id", getRelatedBlogs);
router.get("/get-blog/:id", optionalAuth, getBlogByIdController);

// ---- Authenticated routes ----
// Create: multer parses the multipart body first (populating req.body), then
// we validate the text fields, then verify the uploaded image's magic bytes.
router.post(
  "/create-blog",
  authenticateUser,
  isWriter,
  upload.single("image"),
  validate(blogCreateSchema),
  validateImageFile,
  createBlogController
);
// Update: multer parses the multipart body (so title/description/tags/
// status/publishAt populate req.body) and accepts an optional new image.
// validate runs the blogUpdateSchema (restricts any pasted cover URL to
// http(s)); validateImageFile no-ops when no file is uploaded, so content-only
// edits pass through cleanly.
router.put(
  "/update-blog/:id",
  authenticateUser,
  isWriter,
  upload.single("image"),
  validate(blogUpdateSchema),
  validateImageFile,
  updateBlogController
);
router.delete("/delete-blog/:id", authenticateUser, isWriter, deleteBlogController);
router.get("/user-drafts/:userId", authenticateUser, getUserDrafts);
router.get("/user-blog/:id", authenticateUser, userBlogController);
router.get("/recommendations/:userId", authenticateUser, getRecommendedBlogs);

// ---- Version history (author-gated) ----
// Place the literal "/revisions/..." DELETE before the parameterized "/:id/revisions"
// so the two-segment shape can't be misrouted, even though they don't actually collide.
router.delete("/revisions/:revId", authenticateUser, deleteRevision);
router.get("/:id/revisions", authenticateUser, listRevisions);
router.post("/:id/revisions", authenticateUser, createRevision);

module.exports = router;