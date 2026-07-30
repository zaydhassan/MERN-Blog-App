const mongoose = require("mongoose");
const Bookmark = require("../models/bookmarkModel");
const Blog = require("../models/blogModel");
const BlogView = require("../models/blogViewModel");
const { parsePagination, paginateMeta } = require("../utils/pagination");

// Shape a populated blog the same way getAllBlogsController does so the client
// BlogCard can render it unchanged: nested author (username + avatar) + tag
// names. Returns null for blogs that no longer exist.
const shapeBlog = (bookmark) => {
  if (!bookmark.blog) return null;
  return {
    ...bookmark.blog.toObject(),
    user: bookmark.blog.user
      ? {
          _id: bookmark.blog.user._id,
          username: bookmark.blog.user.username,
          profile_image: bookmark.blog.user.profile_image,
        }
      : null,
    bookmarkedAt: bookmark.created_at,
  };
};

// Toggle a bookmark for the authenticated user. Because the (user, blog) pair
// has a unique index, we treat a 11000 duplicate-key on insert as "already
// bookmarked" and delete the existing row — so toggling is idempotent under
// concurrent calls. Returns { bookmarked }.
exports.toggleBookmark = async (req, res) => {
  const blogId = req.body.blog;
  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    return res.status(400).json({ success: false, message: "Invalid blog id." });
  }
  try {
    const existing = await Bookmark.findOne({ user: req.user._id, blog: blogId });
    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ success: true, message: "Bookmark removed.", bookmarked: false });
    }
    await Bookmark.create({ user: req.user._id, blog: blogId });
    res.status(201).json({ success: true, message: "Bookmark added.", bookmarked: true });
  } catch (error) {
    // Race: another toggle inserted between our findOne and create. Treat as
    // already-bookmarked → remove it so the user still lands in a consistent
    // (un-bookmarked) state, matching their click intent.
    if (error && error.code === 11000) {
      await Bookmark.deleteOne({ user: req.user._id, blog: blogId }).catch(() => {});
      return res.status(200).json({ success: true, message: "Bookmark removed.", bookmarked: false });
    }
    console.error("Error toggling bookmark:", error.message);
    res.status(500).json({ success: false, message: "Failed to toggle bookmark." });
  }
};

// The list of blog ids the authenticated user has bookmarked — cheap, used by
// BlogDetails to render initial bookmark state in one call (no per-card fetch).
exports.getBookmarkedIds = async (req, res) => {
  try {
    const rows = await Bookmark.find({ user: req.user._id }).select("blog -_id");
    res.status(200).json({ success: true, ids: rows.map((r) => String(r.blog)) });
  } catch (error) {
    console.error("Error fetching bookmark ids:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch bookmark ids." });
  }
};

// The user's saved blogs, newest bookmark first. Populated with author + tags
// so the Bookmarks page can reuse the same BlogCard as the rest of the app.
// Only Published blogs are returned (a draft the author saved is meaningless to
// surface here, and drafts may have been unpublished since the user bookmarked).
exports.getBookmarks = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const filter = { user: req.user._id };
    const [rows, total] = await Promise.all([
      Bookmark.find(filter)
        .populate({
          path: "blog",
          match: { status: "Published" },
          populate: [
            { path: "user", select: "username profile_image" },
            { path: "tags", select: "tag_name" },
          ],
        })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Bookmark.countDocuments(filter),
    ]);

    const blogs = rows.map(shapeBlog).filter(Boolean);
    res.status(200).json({
      success: true,
      message: "Bookmarks fetched.",
      blogs,
      ...paginateMeta(page, limit, total),
    });
  } catch (error) {
    console.error("Error fetching bookmarks:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch bookmarks." });
  }
};

// Articles the authenticated user has read, derived from the existing BlogView
// collection (one row per first view per blog). Newest view first. Filters out
// blogs that were deleted or are no longer Published.
exports.getReadingHistory = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const filter = { user_id: req.user._id };
    const [rows, total] = await Promise.all([
      BlogView.find(filter)
        .populate({
          path: "blog_id",
          match: { status: "Published" },
          populate: [
            { path: "user", select: "username profile_image" },
            { path: "tags", select: "tag_name" },
          ],
        })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      BlogView.countDocuments(filter),
    ]);

    const blogs = rows
      .map((v) => (v.blog_id ? { ...v.blog_id.toObject(), readAt: v.created_at } : null))
      .filter(Boolean);

    res.status(200).json({
      success: true,
      message: "Reading history fetched.",
      blogs,
      ...paginateMeta(page, limit, total),
    });
  } catch (error) {
    console.error("Error fetching reading history:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch reading history." });
  }
};