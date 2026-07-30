const mongoose = require("mongoose");
const Like = require("../models/likeModel");
const blogModel = require("../models/blogModel");
const userModel = require("../models/userModel");
const { awardActivity } = require("../utils/points");

// Toggle a like on behalf of the authenticated user. The user is always taken
// from the verified token — never from the body (the old endpoint let anyone
// like/unlike as anyone by passing a spoofed user_id).
//
// Points are awarded atomically *inside the same transaction* as the like
// change, so they can never drift from the like state:
//   - liking:   liker +likeArticle, blog author +receiveLike
//   - unliking:  liker -likeArticle, blog author -receiveLike (floored at 0)
const toggleLike = async (req, res) => {
  const { blog_id } = req.body;
  const user_id = req.user._id;

  if (!blog_id) {
    return res.status(400).json({ success: false, message: "blog_id is required." });
  }
  if (!mongoose.Types.ObjectId.isValid(blog_id)) {
    return res.status(400).json({ success: false, message: "Invalid blog_id." });
  }

  const session = await mongoose.startSession();
  let liked;
  try {
    await session.withTransaction(async () => {
      const blog = await blogModel.findById(blog_id).session(session);
      if (!blog) {
        const err = new Error("Blog not found.");
        err.statusCode = 404;
        throw err;
      }

      const existing = await Like.findOne({ blog_id, user_id }).session(session);
      if (existing) {
        await Like.deleteOne({ _id: existing._id }).session(session);
        await awardActivity(user_id, "likeArticle", -1, session);
        await awardActivity(blog.user, "receiveLike", -1, session);
        liked = false;
        return;
      }

      try {
        const like = new Like({ blog_id, user_id });
        await like.save({ session });
      } catch (e) {
        // Unique-index violation means a concurrent request already created
        // the like. Treat as already-liked (idempotent) rather than failing.
        if (e.code !== 11000) throw e;
        liked = true;
        return;
      }
      await awardActivity(user_id, "likeArticle", 1, session);
      await awardActivity(blog.user, "receiveLike", 1, session);
      liked = true;
    });
  } catch (e) {
    console.error("Error toggling like:", e.message);
    const status = e.statusCode || 500;
    return res
      .status(status)
      .json({ success: false, message: e.statusCode ? e.message : "Failed to toggle like." });
  } finally {
    await session.endSession();
  }

  const likeCount = await Like.countDocuments({ blog_id });
  // Return the liker's updated points so the client can reflect them without
  // a separate (farmable) point endpoint.
  const liker = await userModel.findById(user_id).select("points level badges");

  return res.status(200).json({
    success: true,
    liked,
    likeCount,
    points: liker ? liker.points : undefined,
    level: liker ? liker.level : undefined,
  });
};

// Public read — returns the count + which users liked (used by the client to
// reflect the current user's like state).
const getLikesByBlog = async (req, res) => {
  const { blogId } = req.params;
  try {
    const likes = await Like.find({ blog_id: blogId });
    res.status(200).json({ success: true, likeCount: likes.length, likes });
  } catch (error) {
    console.error("Error fetching likes:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve likes." });
  }
};

module.exports = { toggleLike, getLikesByBlog };
