const mongoose = require("mongoose");

// The denormalized `likes: [ObjectId]` and `comments: [{user, text}]` arrays
// that used to live here have been removed. They duplicated the Like and
// Comment collections and were never kept in sync (likeController wrote only
// to the Like collection), so `blog.likes`/`blog.comments` were always stale.
// Counts are now computed from the real collections (see getTrendingBlogs).
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    status: {
      type: String,
      enum: ["Published", "Draft", "Archived"],
      default: "Draft",
    },
    views: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    user: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: [true, "user id is required"],
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Indexes for the actual query patterns:
//  - listing published blogs (newest first)
//  - browsing by category
//  - listing a user's blogs
blogSchema.index({ status: 1, created_at: -1 });
blogSchema.index({ category: 1, created_at: -1 });
blogSchema.index({ user: 1, created_at: -1 });

const blogModel = mongoose.model("Blog", blogSchema);

module.exports = blogModel;