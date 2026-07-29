const Comment = require("../models/commentModel");
<<<<<<< HEAD
const blogModel = require("../models/blogModel");
const { awardActivity } = require("../utils/points");
const { parsePagination, paginateMeta } = require("../utils/pagination");

// Any authenticated user (Reader / Writer / Admin) may comment. The author is
// always taken from the verified token — never from the request body, which
// was spoofable.
exports.createComment = async (req, res) => {
  const { content, blog_id } = req.body;
  const user_id = req.user._id;

  if (!content || !blog_id) {
    return res
      .status(400)
      .json({ success: false, message: "Content and blog_id are required." });
  }

  try {
    const comment = await Comment.create({
      content,
      blog_id,
      user_id,
    });

    // Best-effort point awarding (server-side, so it can't be farmed via a
    // separate endpoint): the commenter earns commentArticle points and the
    // blog's author earns receiveComment points. A failure here must not
    // block the comment from being returned — it only means the user keeps
    // their previous point total.
    try {
      const blog = await blogModel.findById(blog_id).select("user");
      if (blog) {
        await awardActivity(user_id, "commentArticle", 1);
        await awardActivity(blog.user, "receiveComment", 1);
      }
    } catch (awardErr) {
      console.error("Point award failed for comment:", awardErr.message);
    }

    const populatedComment = await comment.populate("user_id", "_id username profile_image");
    const commentCount = await Comment.countDocuments({ blog_id });

    res.status(201).json({ success: true, comment: populatedComment, commentCount });
  } catch (error) {
    console.error("Create comment error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create comment." });
  }
};

// Only the comment's author (or an Admin) may edit it.
=======

exports.createComment = async (req, res) => {
  const { content, blog_id, user_id,role } = req.body;
  
  if (!["Reader", "Writer"].includes(role)) {
    return res.status(403).json({ success: false, message: "Only Readers and Writers can leave comments." });
  }
  
  try {
    const comment = await new Comment({
      content,
      blog_id,
      user_id,
      created_at: new Date(),
      updated_at: new Date()
    }).save();
    
    const populatedComment = await comment.populate("user_id", "_id username profile_image");
    
    const commentCount = await Comment.countDocuments({ blog_id });
    
    res.status(201).send({
      success: true,
      comment: populatedComment,  // Send the comment with user details
      commentCount
    });
    
  } catch (error) {
    res.status(500).send({ success: false, message: "Failed to create comment", error });
  }
};

>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
exports.updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

<<<<<<< HEAD
  if (!content) {
    return res.status(400).json({ success: false, message: "Content is required." });
  }

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }
    if (String(comment.user_id) !== String(req.user._id) && req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Not allowed to edit this comment." });
    }

    comment.content = content;
    comment.updated_at = new Date();
    await comment.save();

    res.status(200).json({ success: true, comment });
  } catch (error) {
    console.error("Update comment error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update comment." });
  }
};

// Reply author is the authenticated user.
exports.addReply = async (req, res) => {
  const { parentId, content } = req.body;
  const user_id = req.user._id;

  if (!parentId || !content) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
=======
  try {
    const updatedComment = await Comment.findByIdAndUpdate(commentId, { content, updated_at: new Date() }, { new: true });
    if (!updatedComment) {
      return res.status(404).send({ message: 'Comment not found' });
    }
    res.status(200).send(updatedComment);
  } catch (error) {
    res.status(500).send({ message: 'Failed to update comment', error });
  }
};

exports.addReply = async (req, res) => {
  const { parentId, content, user_id } = req.body;

  if (!parentId || !content || !user_id) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
  }

  try {
    const comment = await Comment.findById(parentId);
    if (!comment) {
<<<<<<< HEAD
      return res.status(404).json({ success: false, message: "Comment not found." });
    }
    comment.replies.push({ user_id, content, created_at: new Date() });
    await comment.save();

    const reply = comment.replies[comment.replies.length - 1];
    res.status(201).json({ success: true, reply });
  } catch (error) {
    console.error("Add reply error:", error.message);
    res.status(500).json({ success: false, message: "Failed to add reply." });
  }
};

// Only the author (or Admin) may delete.
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }
    if (String(comment.user_id) !== String(req.user._id) && req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Not allowed to delete this comment." });
    }

    await Comment.deleteOne({ _id: comment._id });
    res.status(200).json({ success: true, message: "Comment deleted." });
  } catch (error) {
    console.error("Delete comment error:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete comment." });
  }
};

// Public: anyone can read a blog's comments. Supports optional pagination
// via ?page=&limit= — when a limit is provided the response is one page plus
// pagination meta; without a limit it returns the full list (backward
// compatible). The total comment count is always returned so clients can
// render the badge without loading every comment.
exports.getCommentsByBlog = async (req, res) => {
  const { blogId } = req.params;
  const filter = { blog_id: blogId };
  try {
    if (req.query.limit !== undefined) {
      const { page, limit, skip } = parsePagination(req);
      const [comments, total] = await Promise.all([
        Comment.find(filter)
          .populate("user_id", "_id username profile_image")
          .populate("replies.user_id", "_id username profile_image")
          .sort({ created_at: 1 })
          .skip(skip)
          .limit(limit),
        Comment.countDocuments(filter),
      ]);
      return res.status(200).json({
        success: true,
        comments,
        commentCount: total,
        ...paginateMeta(page, limit, total),
      });
    }

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate("user_id", "_id username profile_image")
        .populate("replies.user_id", "_id username profile_image")
        .sort({ created_at: 1 }),
      Comment.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, comments, commentCount: total });
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve comments." });
  }
};

// Reporter is the authenticated user.
exports.reportComment = async (req, res) => {
  const { commentId } = req.body;
  const userId = req.user._id;

  if (!commentId) {
    return res.status(400).json({ success: false, message: "commentId is required." });
=======
      return res.status(404).json({ success: false, message: "Comment not found" });
    }
    const reply = {
      user_id,
      content,
      created_at: new Date(),
    };

    comment.replies.push(reply);
    await comment.save();

    res.status(201).json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add reply", error });
  }
};

exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  try {
      const deletedComment = await Comment.findByIdAndDelete(commentId);
      if (!deletedComment) {
          return res.status(404).send({ message: 'Comment not found' });
      }
      res.status(204).send();
  } catch (error) {
      console.error(`Error deleting comment: ${error}`);
      res.status(500).send({ message: 'Failed to delete comment', error: error.toString() });
  }
};

exports.getCommentsByBlog = async (req, res) => {
  const { blogId } = req.params;
  try {
    const comments = await Comment.find({ blog_id: blogId })
    .populate("user_id", "_id username profile_image");
 
    if (!comments) {
      return res.status(404).send({ success: false, message: "No comments found" });
    }

    res.status(200).send({ success: true, comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send({ success: false, message: "Failed to retrieve comments", error });
  }
};

exports.reportComment = async (req, res) => {
  const { commentId, userId } = req.body;

  if (!commentId || !userId) {
    return res.status(400).json({ success: false, message: "Invalid request: Missing commentId or userId" });
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
  }

  try {
    const comment = await Comment.findById(commentId);
<<<<<<< HEAD
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    const already = comment.reportedBy.some(
      (id) => String(id) === String(userId)
    );
    if (already) {
      return res.status(400).json({ success: false, message: "You have already reported this comment." });
    }

    comment.reportedBy.push(userId);
    await comment.save();
    return res.status(200).json({ success: true, message: "Comment reported successfully!" });
  } catch (error) {
    console.error("Error reporting comment:", error.message);
    return res.status(500).json({ success: false, message: "Error reporting comment." });
  }
};

// Admin-only: list reported comments for the moderation queue.
=======
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    if (!comment.reportedBy.includes(userId)) {
      comment.reportedBy.push(userId);
      await comment.save();
      return res.status(200).json({ success: true, message: "Comment reported successfully!" });
    } else {
      return res.status(400).json({ success: false, message: "You have already reported this comment." });
    }
  } catch (error) {
    console.error("Error reporting comment:", error);
    return res.status(500).json({ success: false, message: "Error reporting comment" });
  }
};

>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
exports.getReportedComments = async (req, res) => {
  try {
    const reportedComments = await Comment.find({ reportedBy: { $exists: true, $ne: [] } })
      .populate("user_id", "username")
<<<<<<< HEAD
      .populate("reportedBy", "username");

    return res.status(200).json({ success: true, reportedComments });
  } catch (error) {
    console.error("Error fetching reported comments:", error.message);
    return res.status(500).json({ success: false, message: "Error fetching reported comments." });
=======
      .populate("reportedBy", "username"); 

    return res.status(200).json({ success: true, reportedComments });
  } catch (error) {
    console.error("Error fetching reported comments:", error);
    return res.status(500).json({ success: false, message: "Error fetching reported comments" });
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
  }
};