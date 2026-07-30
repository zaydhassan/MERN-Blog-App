const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
} = require("../controllers/notificationController");

// All notification routes require auth — a user only ever sees their own.
// Static segments (/unread-count, /read-all) are registered before any
// `/:param` route so they can't be shadowed.
router.get("/unread-count", authenticateUser, getUnreadCount);
router.get("/", authenticateUser, getNotifications);
router.patch("/read-all", authenticateUser, markAllRead);
router.patch("/:id/read", authenticateUser, markRead);
router.delete("/:id", authenticateUser, deleteNotification);

module.exports = router;