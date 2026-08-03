const mongoose = require("mongoose");

// A user's saved-for-later blogs. One bookmark per (user, blog) — the unique
// compound index enforces it, and `toggleBookmark` treats a duplicate-key
// (11000) error on insert as "already bookmarked" and removes the existing
// row instead.
const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

// One bookmark per (user, blog) — DB-enforced so concurrent toggles can't
// create duplicates.
bookmarkSchema.index({ user: 1, blog: 1 }, { unique: true });
// A user's bookmarks, newest first (the Bookmarks page fetch).
bookmarkSchema.index({ user: 1, created_at: -1 });

const Bookmark =
  mongoose.models.Bookmark ||
  mongoose.model("Bookmark", bookmarkSchema);

module.exports = Bookmark;