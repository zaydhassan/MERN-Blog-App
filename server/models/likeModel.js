const mongoose = require("mongoose");

<<<<<<< HEAD
// A like is the unique pair (blog, user). The compound unique index below
// enforces "one like per user per blog" at the DB level — the application's
// find-then-create toggle can't be raced into creating duplicates.
const likeSchema = new mongoose.Schema({
  blog_id: { type: mongoose.Schema.Types.ObjectId, ref: "Blog" },
  // FIX: was `ref: 'User'`, but the user model is registered as "users", so
  // any populate() on this field silently returned null. Now matches.
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  created_at: { type: Date, default: Date.now },
});

likeSchema.index({ blog_id: 1, user_id: 1 }, { unique: true });
// Support the common "who liked this blog" + count queries.
likeSchema.index({ blog_id: 1, created_at: -1 });
// Supports user-scoped queries: getRecommendedBlogs (distinct blog_id by
// user) and the cascade deletes in adminController (deleteMany by user_id).
likeSchema.index({ user_id: 1 });

=======
const likeSchema = new mongoose.Schema({
  blog_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now }
});

>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
const Like = mongoose.model("Like", likeSchema);

module.exports = Like;