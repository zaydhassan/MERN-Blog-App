const mongoose = require("mongoose");
const User = require("../models/userModel");
const Blog = require("../models/blogModel");
const Comment = require("../models/commentModel");
const Like = require("../models/likeModel");
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
      }
      await Blog.deleteMany({ user: id }).session(session);
      // Delete the user's own comments/likes elsewhere.
      await Comment.deleteMany({ user_id: id }).session(session);
      await Like.deleteMany({ user_id: id }).session(session);
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

// Cascade delete: removing a blog also removes its comments and likes.
const deleteBlog = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    await session.withTransaction(async () => {
      await Comment.deleteMany({ blog_id: id }).session(session);
      await Like.deleteMany({ blog_id: id }).session(session);
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

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
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
