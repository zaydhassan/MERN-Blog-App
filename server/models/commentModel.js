const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  blog_id: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  replies: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    content: { type: String },
    created_at: { type: Date, default: Date.now }
  }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "users", default: [] }]
});

// The dominant query is "all comments for a blog, oldest first".
CommentSchema.index({ blog_id: 1, created_at: 1 });
// Supports user-scoped queries: getRecommendedBlogs (distinct blog_id by
// user) and the cascade deletes in adminController (deleteMany by user_id).
CommentSchema.index({ user_id: 1 });

const Comment = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);

module.exports = Comment;