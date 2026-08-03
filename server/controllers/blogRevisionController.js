const mongoose = require("mongoose");
const blogModel = require("../models/blogModel");
const BlogRevision = require("../models/blogRevisionModel");
const { sanitizeHtml } = require("../utils/sanitize");

// All revision routes are author-gated: only the blog's owner (or an Admin)
// may list/create/delete snapshots of a post. A reader can't read another
// writer's draft history.
const ensureOwnership = async (blogId, user) => {
  const blog = await blogModel.findById(blogId).select("user");
  if (!blog) return { code: 404, message: "Blog not found." };
  if (String(blog.user) !== String(user._id) && user.role !== "Admin") {
    return { code: 403, message: "Not allowed." };
  }
  return null;
};

// Normalize incoming tags to an array of tag-name strings. The editor sends
// tags as a JSON.stringify([...]) string (the same convention as create-blog),
// so accept either a JSON string, a comma string, or an actual array.
const normalizeTagNames = (tags) => {
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // fall through to comma split
    }
    return tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
};

// GET /api/v1/blog/:id/revisions — newest 50 snapshots for this blog.
exports.listRevisions = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid blog ID." });
    }
    const denied = await ensureOwnership(id, req.user);
    if (denied) return res.status(denied.code).json({ success: false, message: denied.message });

    const revisions = await BlogRevision.find({ blog: id }).sort({ created_at: -1 }).limit(50).lean();
    return res.status(200).json({ success: true, revisions });
  } catch (error) {
    console.error("Error listing revisions:", error.message);
    return res.status(500).json({ success: false, message: "Error fetching revisions." });
  }
};

// POST /api/v1/blog/:id/revisions — save a named manual checkpoint of the
// current editor state. The client sends the live editor content; the server
// sanitizes the description before persisting.
exports.createRevision = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid blog ID." });
    }
    const denied = await ensureOwnership(id, req.user);
    if (denied) return res.status(denied.code).json({ success: false, message: denied.message });

    const { title, description, category, tags, label } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: "Title is required for a snapshot." });
    }

    const revision = await BlogRevision.create({
      blog: id,
      author: req.user._id,
      title: String(title).trim(),
      description: sanitizeHtml(description || ""),
      category: category || "",
      tags: normalizeTagNames(tags),
      label: label ? String(label).trim() : "Snapshot",
    });

    return res.status(201).json({ success: true, revision });
  } catch (error) {
    console.error("Error creating revision:", error.message);
    return res.status(500).json({ success: false, message: "Error saving snapshot." });
  }
};

// DELETE /api/v1/blog/revisions/:revId — remove a snapshot. Owner is derived
// from the revision's blog (falls back to the revision's author if the blog
// was deleted, so orphaned snapshots can still be cleaned up).
exports.deleteRevision = async (req, res) => {
  try {
    const { revId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(revId)) {
      return res.status(400).json({ success: false, message: "Invalid revision ID." });
    }
    const rev = await BlogRevision.findById(revId).populate("blog", "user");
    if (!rev) {
      return res.status(404).json({ success: false, message: "Revision not found." });
    }
    const ownerId = rev.blog ? rev.blog.user : rev.author;
    if (String(ownerId) !== String(req.user._id) && req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Not allowed." });
    }
    await rev.deleteOne();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting revision:", error.message);
    return res.status(500).json({ success: false, message: "Error deleting revision." });
  }
};