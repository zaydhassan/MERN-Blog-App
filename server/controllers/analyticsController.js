const Blog = require("../models/blogModel");
const Like = require("../models/likeModel");
const Comment = require("../models/commentModel");
const BlogView = require("../models/blogViewModel");

// Build a contiguous 30-day label array (oldest → newest) and a map from
// "YYYY-MM-DD" → index, so sparse aggregation results can be fanned out into a
// full series with 0s on days that had no activity.
const build30DaySeries = () => {
  const labels = [];
  const index = {};
  const DAY = 24 * 60 * 60 * 1000;
  // Anchor on local midnight of (now - 29d) so the chart always shows the last
  // 30 calendar days ending today.
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(start.getTime() - i * DAY);
    const key = d.toISOString().slice(0, 10);
    labels.push(key);
    index[key] = labels.length - 1;
  }
  return { labels, index, since: new Date(start.getTime() - 29 * DAY) };
};

// Daily-bucket aggregation over a model's `created_at` for the given blog ids.
// Returns an array the length of `labels`, filled with counts per day.
const dailyCounts = async (Model, blogIds, filterField, labels, index, since) => {
  if (!blogIds.length) return labels.map(() => 0);
  const rows = await Model.aggregate([
    { $match: { [filterField]: { $in: blogIds }, created_at: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
        count: { $sum: 1 },
      },
    },
  ]);
  const out = labels.map(() => 0);
  for (const r of rows) {
    if (r._id && index[r._id] !== undefined) out[index[r._id]] = r.count;
  }
  return out;
};

// Writer-facing analytics for the authenticated user's own posts. KPIs +
// a 30-day views/likes/comments time series + top posts + category mix.
// Admins are allowed through isWriter, but the data is still scoped to
// req.user._id's blogs (an admin viewing "their" author stats) — a cross-user
// view is intentionally not exposed here to keep the surface small.
exports.getAuthorStats = async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.user._id }).select(
      "_id title views status category created_at"
    );
    const blogIds = blogs.map((b) => b._id);

    const [totalLikes, totalComments] = await Promise.all([
      Like.countDocuments({ blog_id: { $in: blogIds } }),
      Comment.countDocuments({ blog_id: { $in: blogIds } }),
    ]);

    const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);
    const publishedPosts = blogs.filter((b) => b.status === "Published").length;

    const { labels, index, since } = build30DaySeries();
    const [views, likes, comments] = await Promise.all([
      dailyCounts(BlogView, blogIds, "blog_id", labels, index, since),
      dailyCounts(Like, blogIds, "blog_id", labels, index, since),
      dailyCounts(Comment, blogIds, "blog_id", labels, index, since),
    ]);

    // Top 5 posts by views, each enriched with live like + comment counts.
    const topBlogs = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    const topPosts = await Promise.all(
      topBlogs.map(async (b) => {
        const [lc, cc] = await Promise.all([
          Like.countDocuments({ blog_id: b._id }),
          Comment.countDocuments({ blog_id: b._id }),
        ]);
        return {
          _id: b._id,
          title: b.title,
          views: b.views || 0,
          likes: lc,
          comments: cc,
          status: b.status,
        };
      })
    );

    // Category distribution across the author's posts.
    const catMap = {};
    for (const b of blogs) catMap[b.category] = (catMap[b.category] || 0) + 1;
    const categories = Object.entries(catMap).map(([category, count]) => ({ category, count }));

    res.status(200).json({
      success: true,
      message: "Author stats fetched.",
      kpis: { totalViews, totalLikes, totalComments, publishedPosts, totalPosts: blogs.length },
      timeseries: { labels, views, likes, comments },
      topPosts,
      categories,
    });
  } catch (error) {
    console.error("Error fetching author stats:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch author stats." });
  }
};