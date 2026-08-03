const mongoose = require("mongoose");
const User = require("../models/userModel");
const Blog = require("../models/blogModel");
const Comment = require("../models/commentModel");
const Like = require("../models/likeModel");
const Bookmark = require("../models/bookmarkModel");
const Notification = require("../models/notificationModel");
const PointEvent = require("../models/pointEventModel");
const BlogView = require("../models/blogViewModel");
const Follow = require("../models/followModel");
const WritingActivity = require("../models/writingActivityModel");
const BlogRevision = require("../models/blogRevisionModel");
const BlogTag = require("../models/BlogTag");
const { awardActivity } = require("../utils/points");
const { publicUser } = require("../utils/tokenUtils");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("user", "username email");
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    console.error("❌ Error fetching blogs:", error);
    res.status(500).json({ success: false, message: "Failed to fetch blogs" });
  }
};

// Cascade delete: removing a user also removes their blogs, comments and
// likes, and the comments/likes that belonged to those blogs. Done in a
// transaction so we don't leave orphans if one step fails.
const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    const userBlogs = await Blog.find({ user: id }).select("_id");
    const blogIds = userBlogs.map((b) => b._id);

    await session.withTransaction(async () => {
      // Delete everything attached to the user's blogs.
      if (blogIds.length) {
        await Comment.deleteMany({ blog_id: { $in: blogIds } }).session(session);
        await Like.deleteMany({ blog_id: { $in: blogIds } }).session(session);
        await Bookmark.deleteMany({ blog: { $in: blogIds } }).session(session);
        await Notification.deleteMany({ blog: { $in: blogIds } }).session(session);
        await BlogView.deleteMany({ blog_id: { $in: blogIds } }).session(session);
        await BlogRevision.deleteMany({ blog: { $in: blogIds } }).session(session);
        await BlogTag.deleteMany({ blog_id: { $in: blogIds } }).session(session);
      }
      await Blog.deleteMany({ user: id }).session(session);
      // Delete the user's own comments/likes/bookmarks/views elsewhere.
      await Comment.deleteMany({ user_id: id }).session(session);
      await Like.deleteMany({ user_id: id }).session(session);
      await Bookmark.deleteMany({ user: id }).session(session);
      await BlogView.deleteMany({ user_id: id }).session(session);
      // Notifications where the deleted user was recipient or actor, and
      // their point ledger (so time-windowed leaderboards drop them).
      await Notification.deleteMany({
        $or: [{ recipient: id }, { actor: id }],
      }).session(session);
      await PointEvent.deleteMany({ user: id }).session(session);
      // Follow edges where the deleted user is either side, and their daily
      // writing ledger (streak/goal history).
      await Follow.deleteMany({ $or: [{ follower: id }, { followee: id }] }).session(session);
      await WritingActivity.deleteMany({ user: id }).session(session);
      await User.findByIdAndDelete(id).session(session);
    });

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  } finally {
    session.endSession();
  }
};

// Cascade delete: removing a blog also removes its comments, likes,
// bookmarks, notifications, view rows, revision history and tag links —
// matching the writer-side delete cascade (which previously left these
// orphaned). Done in a transaction so we don't leave orphans if one step fails.
const deleteBlog = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    await session.withTransaction(async () => {
      await Comment.deleteMany({ blog_id: id }).session(session);
      await Like.deleteMany({ blog_id: id }).session(session);
      await Bookmark.deleteMany({ blog: id }).session(session);
      await Notification.deleteMany({ blog: id }).session(session);
      await BlogView.deleteMany({ blog_id: id }).session(session);
      await BlogRevision.deleteMany({ blog: id }).session(session);
      await BlogTag.deleteMany({ blog_id: id }).session(session);
      await Blog.findByIdAndDelete(id).session(session);
    });
    res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting blog:", error);
    res.status(500).json({ success: false, message: "Failed to delete blog" });
  } finally {
    session.endSession();
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find().populate("user_id", "username email");
    res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error("Error fetching comments: ", error);
    res.status(500).json({ success: false, message: "Failed to fetch comments" });
  }
};

// Admin comment deletion. Reverses the points that were awarded when the
// comment was created (best-effort, never blocks the delete) so an admin
// removing a farmed/abusive comment also claws back the points it granted.
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }
    try {
      const blog = await Blog.findById(comment.blog_id).select("user");
      if (blog) {
        await awardActivity(comment.user_id, "commentArticle", -1);
        if (String(blog.user) !== String(comment.user_id)) {
          await awardActivity(blog.user, "receiveComment", -1);
        }
      }
    } catch (revErr) {
      console.error("Point reversal failed on admin comment delete:", revErr.message);
    }
    await Comment.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting comment:", error);
    res.status(500).json({ success: false, message: "Failed to delete comment" });
  }
};

// Change a user's role (Reader / Writer / Admin). This is the supported way
// to create an Admin — registration forces role: Reader, so without this an
// admin had to be hand-edited in MongoDB. Includes a guard so an admin can't
// demote themselves if they're the last admin (which would lock out the
// system).
const promoteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user id." });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Prevent removing the last admin: if the acting admin is demoting
    // themselves away from Admin, make sure another admin remains.
    if (
      String(id) === String(req.user._id) &&
      req.user.role === "Admin" &&
      role !== "Admin"
    ) {
      const adminCount = await User.countDocuments({ role: "Admin" });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ success: false, message: "Cannot demote the last remaining admin." });
      }
    }

    target.role = role;
    await target.save();

    res.status(200).json({
      success: true,
      message: "User role updated.",
      user: publicUser(target),
    });
  } catch (error) {
    console.error("❌ Error updating user role:", error);
    res.status(500).json({ success: false, message: "Failed to update user role" });
  }
};

module.exports = {
  getAllUsers,
  getAllBlogs,
  deleteUser,
  getComments,
  deleteComment,
  deleteBlog,
  promoteUser,
};
