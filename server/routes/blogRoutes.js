const express = require("express");
const { upload, validateImageFile } = require("../config/upload");
const validate = require("../middleware/validate");
const { authenticateUser, isWriter, optionalAuth } = require("../middleware/authMiddleware");
const { blogCreateSchema } = require("../validators/schemas");
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
} = require("../controllers/blogController");

const router = express.Router();

// ---- Public read routes (anyone can browse/read) ----
router.get("/all-blog", getAllBlogsController);
router.get("/trending", getTrendingBlogs);
router.get("/category/:category", getBlogsByCategory);
router.get("/tag/:tagId", getBlogsByTag);
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
router.put("/update-blog/:id", authenticateUser, isWriter, updateBlogController);
router.delete("/delete-blog/:id", authenticateUser, isWriter, deleteBlogController);
router.get("/user-drafts/:userId", authenticateUser, getUserDrafts);
router.get("/user-blog/:id", authenticateUser, userBlogController);
router.get("/recommendations/:userId", authenticateUser, getRecommendedBlogs);

module.exports = router;