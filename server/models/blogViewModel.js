const mongoose = require("mongoose");

// Records that a given authenticated user has viewed a given blog. The unique
// compound index below means a (blog, user) pair can exist at most once, so we
// can attempt an insert and treat the 11000 duplicate-key error as "already
// viewed" — that's how `getBlogByIdController` awards `readArticle` points only
// on a reader's FIRST view of each blog, while still counting every fetch in
// `blog.views` (anonymous + repeat views increment the counter but earn no
// points). Anonymous (no req.user) views are not recorded here.
const blogViewSchema = new mongoose.Schema(
  {
    blog_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

// One view record per (blog, user). Enforced at the DB so concurrent first-view
// requests can't both award points.
blogViewSchema.index({ blog_id: 1, user_id: 1 }, { unique: true });

const BlogView = mongoose.model("BlogView", blogViewSchema);

module.exports = BlogView;