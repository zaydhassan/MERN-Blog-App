const mongoose = require("mongoose");
const Notification = require("../models/notificationModel");
const { parsePagination, paginateMeta } = require("../utils/pagination");

// A user's notifications, newest first. Paginated. The actor is populated with
// a public projection (username + avatar) and the blog with its title/id so the
// client can link to the relevant post without an extra fetch.
exports.getNotifications = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const filter = { recipient: req.user._id };
    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate("actor", "_id username profile_image")
        .populate("blog", "_id title")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Notifications fetched.",
      notifications,
      ...paginateMeta(page, limit, total),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch notifications." });
  }
};

// Unread count for the Navbar bell badge. Cheap countDocuments on the
// {recipient, read} index.
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });
    res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch unread count." });
  }
};

// Mark a single notification read. Ownership: only the recipient may touch it.
exports.markRead = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid notification id." });
  }
  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    if (String(notification.recipient) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not allowed." });
    }
    notification.read = true;
    await notification.save();
    res.status(200).json({ success: true, message: "Marked as read.", notification });
  } catch (error) {
    console.error("Error marking notification read:", error.message);
    res.status(500).json({ success: false, message: "Failed to mark notification." });
  }
};

// Mark every unread notification for the authenticated user as read.
exports.markAllRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      updated: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications read:", error.message);
    res.status(500).json({ success: false, message: "Failed to mark notifications." });
  }
};

// Delete a single notification. Ownership: only the recipient.
exports.deleteNotification = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid notification id." });
  }
  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    if (String(notification.recipient) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not allowed." });
    }
    await notification.deleteOne();
    res.status(200).json({ success: true, message: "Notification deleted." });
  } catch (error) {
    console.error("Error deleting notification:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete notification." });
  }
};