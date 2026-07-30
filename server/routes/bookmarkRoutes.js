const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { bookmarkSchema } = require("../validators/schemas");
const {
  toggleBookmark,
  getBookmarks,
  getBookmarkedIds,
  getReadingHistory,
} = require("../controllers/bookmarkController");

// Bookmarks. Static segments (/toggle, /ids) are registered before any
// /:param route so they can't be shadowed (same class of bug we fixed on
// userRoutes for /all-users).
const router = express.Router();
router.post("/toggle", authenticateUser, validate(bookmarkSchema), toggleBookmark);
router.get("/ids", authenticateUser, getBookmarkedIds);
router.get("/", authenticateUser, getBookmarks);

// Reading history is a distinct resource, so it gets its own mounted base path
// (/api/v1/reading-history) but lives here next to bookmarks for locality.
const readingHistoryRouter = express.Router();
readingHistoryRouter.get("/", authenticateUser, getReadingHistory);

module.exports = { router, readingHistoryRouter };