const mongoose = require("mongoose");

// In-app notifications. `recipient` is the user who receives the notification,
// `actor` is the user whose action generated it (e.g. the liker/commenter).
// `blog` is optional context for like/comment/reply notifications. `type`
// drives the icon + text shown in the bell + Notifications page. Best-effort:
// notification creation never blocks the parent operation (like/comment/award).
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    type: {
      type: String,
      enum: ["like", "comment", "reply", "badge", "levelUp", "system"],
      required: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      default: null,
    },
    text: {
      type: String,
      default: "",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

// A user's notifications, newest first (the notifications page + bell fetch).
notificationSchema.index({ recipient: 1, created_at: -1 });
// Unread count query: `{ recipient, read: false }` → countDocuments.
notificationSchema.index({ recipient: 1, read: 1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

module.exports = Notification;