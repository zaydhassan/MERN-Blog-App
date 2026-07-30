const blogModel = require("../models/blogModel");
const userModel = require("../models/userModel");
const mongoose= require("mongoose");
const Tag = require("../models/Tag");
const BlogTag = require("../models/BlogTag");
const Comment = require("../models/commentModel");
const Like = require("../models/likeModel");
const BlogView = require("../models/blogViewModel");
const Bookmark = require("../models/bookmarkModel");
const Notification = require("../models/notificationModel");
const { awardActivity } = require("../utils/points");
const { parsePagination, paginateMeta } = require("../utils/pagination");
const { sanitizeHtml } = require("../utils/sanitize");

// Trending is now computed from the REAL like / comment collections via
// $lookup, instead of sorting by the denormalized blog.likes / blog.comments
// arrays (which were removed — they were never kept in sync). Popularity =
// likeCount + commentCount + views.
exports.getTrendingBlogs = async (req, res) => {
  try {
    const trendingBlogs = await blogModel.aggregate([
      { $match: { status: "Published" } },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "blog_id",
          as: "likeDocs",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "blog_id",
          as: "commentDocs",
        },
      },
      {
        $addFields: {
          likeCount: { $size: "$likeDocs" },
          commentCount: { $size: "$commentDocs" },
        },
      },
      { $sort: { likeCount: -1, commentCount: -1, views: -1, created_at: -1 } },
      { $limit: 5 },
      { $project: { likeDocs: 0, commentDocs: 0 } },
    ]);

    // Populate the author on the aggregation result (aggregate bypasses
    // Mongoose populate, so do it manually).
    await blogModel.populate(trendingBlogs, { path: "user", select: "username profile_image" });

    return res.status(200).json({ success: true, trending: trendingBlogs });
  } catch (error) {
    console.error("Error fetching trending blogs:", error.message);
    res.status(500).json({ success: false, message: "Error fetching trending blogs" });
  }
};

exports.getRecommendedBlogs = async (req, res) => {
  // Use the authenticated user; ignore the client-supplied :userId param.
  const userId = req.user._id;

  try {
    // Blogs the user has engaged with, derived from the real Like / Comment
    // collections (the old query used the removed blog.likes / blog.comments
    // arrays, which were stale and now gone).
    const [likedIds, commentedIds] = await Promise.all([
      Like.find({ user_id: userId }).distinct("blog_id"),
      Comment.find({ user_id: userId }).distinct("blog_id"),
    ]);
    const engagedIds = [...likedIds, ...commentedIds];

    let recommendedBlogs = [];
    if (engagedIds.length) {
      recommendedBlogs = await blogModel
        .find({ _id: { $in: engagedIds }, status: "Published" })
        .populate("user", "username profile_image")
        .limit(5);
    }

    if (recommendedBlogs.length === 0) {
      recommendedBlogs = await blogModel
        .find({ status: "Published" })
        .sort({ created_at: -1 })
        .populate("user", "username profile_image")
        .limit(5);
    }

    return res.status(200).json({ success: true, recommendations: recommendedBlogs });
  } catch (error) {
    console.error("Error fetching recommended blogs:", error.message);
    res.status(500).json({ success: false, message: "Error fetching recommended blogs." });
  }
};

exports.getAllBlogsController = async (req, res) => {
  try {
    const { page, limit, skip, searchRegex } = parsePagination(req);
    const filter = { status: "Published" };
    if (searchRegex) {
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const [blogs, total] = await Promise.all([
      blogModel
        .find(filter)
        .populate({ path: "user", select: "username profile_image" })
        .populate("tags", "tag_name")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      blogModel.countDocuments(filter),
    ]);

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    return res.status(200).json({
      success: true,
      message: "All Blogs lists",
      blogs,
      ...paginateMeta(page, limit, total),
    });
  } catch (error) {
    console.error("Error Fetching Blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Error While Getting Blogs",
    });
  }
};

  exports.getBlogsByCategory = async (req, res) => {
    const category = req.params.category;
    try {
        const { page, limit, skip, searchRegex } = parsePagination(req);
        const filter = { category, status: "Published" };
        if (searchRegex) {
          filter.$or = [{ title: searchRegex }, { description: searchRegex }];
        }
        const [blogs, total] = await Promise.all([
          blogModel
            .find(filter)
            .populate("user", "username profile_image")
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit),
          blogModel.countDocuments(filter),
        ]);
        return res.status(200).json({ success: true, blogs, ...paginateMeta(page, limit, total) });
    } catch (error) {
        console.error("Error fetching blogs by category:", error.message);
        res.status(500).json({ success: false, message: "Error fetching blogs by category." });
    }
};

// Public: browse blogs by tag. Accepts either a Tag ObjectId or a tag name.
exports.getBlogsByTag = async (req, res) => {
  const { tagId } = req.params;
  try {
    const { page, limit, skip, searchRegex } = parsePagination(req);
    let filter;
    if (mongoose.Types.ObjectId.isValid(tagId)) {
      filter = { tags: new mongoose.Types.ObjectId(tagId), status: "Published" };
    } else {
      const tag = await Tag.findOne({ tag_name: tagId });
      if (!tag) {
        return res.status(200).json({ success: true, blogs: [], ...paginateMeta(page, limit, 0) });
      }
      filter = { tags: tag._id, status: "Published" };
    }
    if (searchRegex) {
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const [blogs, total] = await Promise.all([
      blogModel
        .find(filter)
        .populate("tags", "tag_name")
        .populate("user", "username profile_image")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      blogModel.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, blogs, ...paginateMeta(page, limit, total) });
  } catch (error) {
    console.error("Error fetching blogs by tag:", error.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Resolve a tags value (which may be an array of names, a JSON string of
// names, or an array of ObjectIds) into an array of Tag ObjectIds, creating
// any new tags as needed. Fixes the bug where sending tags as a JSON array
// silently produced [].
const resolveTagIds = async (tags) => {
  let parsed = tags;
  if (typeof tags === "string") {
    try {
      parsed = JSON.parse(tags);
    } catch {
      parsed = tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(parsed)) parsed = [];

  return Promise.all(
    parsed.map(async (tagName) => {
      const name = String(tagName).trim();
      if (!name) return null;
      let tag = await Tag.findOne({ tag_name: name });
      if (!tag) tag = await Tag.create({ tag_name: name });
      return tag._id;
    })
  ).then((ids) => ids.filter(Boolean));
};

exports.createBlogController = async (req, res) => {
    try {
      const uploadedImage = req.file ? `/uploads/${req.file.filename}` : req.body.image;
      const { title, category, tags, status = "Draft" } = req.body;
      // Sanitize rich text on write so stored XSS markup never reaches the DB.
      const description = sanitizeHtml(req.body.description);
      // The author is the authenticated user — never a body-supplied `user`.
      const authorId = req.user._id;

      if (!title || !description || !category) {
        return res.status(400).json({ success: false, message: "Please provide title, description and category." });
      }
      if (!uploadedImage) {
        return res.status(400).json({ success: false, message: "Image file is required." });
      }

      const tagIds = await resolveTagIds(tags);
      const finalStatus = status || "Draft";

      const newBlog = new blogModel({
        title,
        description,
        image: uploadedImage,
        category,
        tags: tagIds,
        user: authorId,
        status: finalStatus,
        views: 0,
      });

      const session = await mongoose.startSession();
      let publishDelta = null;
      try {
        session.startTransaction();
        await newBlog.save({ session });
        await Promise.all(
          tagIds.map(async (tagId) => {
            await new BlogTag({ blog_id: newBlog._id, tag_id: tagId }).save({ session });
          })
        );
        // Award publish points atomically with the blog creation when the
        // blog is published immediately (Drafts earn nothing until published
        // via updateBlogController).
        if (finalStatus === "Published") {
          publishDelta = await awardActivity(authorId, "publishArticle", 1, session);
        }

        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }

      return res.status(201).json({
        success: true,
        message: "Blog Created!",
        newBlog,
        points: publishDelta ? publishDelta.points : undefined,
        level: publishDelta ? publishDelta.level : undefined,
        badges: publishDelta ? publishDelta.badges : undefined,
        leveledUp: publishDelta ? publishDelta.leveledUp : false,
        newBadges: publishDelta ? publishDelta.newBadges : [],
      });
    } catch (error) {
      console.error("Create blog error:", error.message);
      return res.status(400).json({ success: false, message: "Error while creating blog." });
    }
};

exports.updateBlogController = async (req, res) => {
  try {
      const { id } = req.params;
      const { title, description, image, status, category, tags } = req.body;

      const blog = await blogModel.findById(id);
      if (!blog) {
          return res.status(404).json({ success: false, message: "Blog not found." });
      }
      // Ownership: only the author (or an Admin) may edit.
      if (String(blog.user) !== String(req.user._id) && req.user.role !== "Admin") {
          return res.status(403).json({ success: false, message: "Not allowed to edit this blog." });
      }

      if (title !== undefined) blog.title = title;
      if (description !== undefined) blog.description = sanitizeHtml(description);
      if (image !== undefined) blog.image = image;
      // Award publish points the first time a blog transitions to Published
      // (Draft/Archived -> Published). Re-publishing an already-Published
      // blog earns nothing, so a user can't farm points by toggling status.
      const publishingNow =
        status !== undefined &&
        status === "Published" &&
        blog.status !== "Published";
      if (status !== undefined) blog.status = status;
      if (category !== undefined) blog.category = category;
      if (tags !== undefined) blog.tags = await resolveTagIds(tags);

      // Save the blog and award the publish points atomically: if the point
      // award fails, the status change rolls back too, so a "Published" blog
      // always has its points (and vice versa).
      const session = await mongoose.startSession();
      let publishDelta = null;
      try {
        await session.withTransaction(async () => {
          await blog.save({ session });
          if (publishingNow) {
            publishDelta = await awardActivity(req.user._id, "publishArticle", 1, session);
          }
        });
      } finally {
        session.endSession();
      }

      return res.status(200).json({
        success: true,
        message: "Blog Updated!",
        blog,
        points: publishDelta ? publishDelta.points : undefined,
        level: publishDelta ? publishDelta.level : undefined,
        badges: publishDelta ? publishDelta.badges : undefined,
        leveledUp: publishDelta ? publishDelta.leveledUp : false,
        newBadges: publishDelta ? publishDelta.newBadges : [],
      });
  } catch (error) {
      console.error("Error updating blog:", error.message);
      return res.status(500).json({ success: false, message: "Error updating blog." });
  }
};

  exports.getUserDrafts = async (req, res) => {
    try {
        const { userId } = req.params;
        // A user may only read their own drafts (Admin may read anyone's).
        if (String(userId) !== String(req.user._id) && req.user.role !== "Admin") {
          return res.status(403).json({ success: false, message: "Not allowed." });
        }
        const drafts = await blogModel.find({ user: userId, status: "Draft" });

        res.status(200).json({ success: true, drafts });
    } catch (error) {
        console.error("Error retrieving drafts:", error.message);
        res.status(500).json({ success: false, message: "Error retrieving drafts." });
    }
};
  
  exports.getBlogByIdController = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid blog ID." });
      }

      // Count the view (every fetch, anonymous or not) so trending's `views`
      // sort actually reflects traffic. Use `$inc` on the doc rather than a
      // read-modify-write so concurrent views don't lose increments.
      const blog = await blogModel
        .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
        .populate("user", "username profile_image");

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found with this ID.",
        });
      }

      // For an authenticated reader, award `readArticle` points once per blog
      // (deduped by the BlogView unique index). Anonymous fetches skip this.
      if (req.user) {
        try {
          await BlogView.create({ blog_id: blog._id, user_id: req.user._id });
          // Insert succeeded → first view by this user → award points.
          // awardActivity is a no-op for Writers/Admins (readArticle is a
          // reader-only activity), so authors viewing their own posts earn 0.
          await awardActivity(req.user._id, "readArticle", 1);
        } catch (viewErr) {
          // 11000 = duplicate key → this user already viewed this blog. Skip
          // the award (they already got their points on the first view). Any
          // other error is logged but never blocks the read.
          if (viewErr?.code !== 11000) {
            console.error("BlogView record failed:", viewErr.message);
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: "Fetched single blog.",
        blog,
      });
    } catch (error) {
      console.error("Error fetching single blog:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error while getting single blog.",
      });
    }
  };
  
  exports.deleteBlogController = async (req, res) => {
    try {
      const blogId = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(blogId)) {
        return res.status(400).json({ success: false, message: "Invalid blog ID" });
      }
  
      const blog = await blogModel.findById(blogId);
      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }
      // Ownership: only the author (or an Admin) may delete.
      if (String(blog.user) !== String(req.user._id) && req.user.role !== "Admin") {
        return res.status(403).json({ success: false, message: "Not allowed to delete this blog." });
      }

      // Cascade: remove the blog's comments, likes, bookmarks and
      // notifications so we don't leave orphaned docs pointing at a deleted
      // blog. BlogView rows are cleaned up too (reading-history references).
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await Comment.deleteMany({ blog_id: blog._id }).session(session);
          await Like.deleteMany({ blog_id: blog._id }).session(session);
          await Bookmark.deleteMany({ blog: blog._id }).session(session);
          await Notification.deleteMany({ blog: blog._id }).session(session);
          await BlogView.deleteMany({ blog_id: blog._id }).session(session);
          await blogModel.deleteOne({ _id: blog._id }).session(session);
        });
      } finally {
        session.endSession();
      }

      return res.status(200).json({ success: true, message: "Blog Deleted Successfully!" });
    } catch (error) {
      console.error("Error deleting blog:", error.message);
      return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
  };

  exports.userBlogController = async (req, res) => {
    try {
      // A user may only list their own blogs (Admin may list anyone's).
      if (String(req.params.id) !== String(req.user._id) && req.user.role !== "Admin") {
        return res.status(403).json({ success: false, message: "Not allowed." });
      }
      const user = await userModel.findById(req.params.id).select("username");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "blogs not found with this id",
        });
      }
      // The user's blogs are sourced from the Blog collection (blogModel.user
      // is the source of truth) rather than the removed denormalized
      // user.blogs array. The response shape ({ userBlog: { blogs } }) is
      // preserved so the client needs no change.
      const blogs = await blogModel.find({ user: req.params.id }).sort({ created_at: -1 });
      return res.status(200).json({
        success: true,
        message: "user blogs",
        userBlog: { _id: user._id, username: user.username, blogs },
      });
    } catch (error) {
      console.error("Error in user blog:", error.message);
      return res.status(400).json({
        success: false,
        message: "error in user blog",
      });
    }
  };
