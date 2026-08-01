// Follow / unfollow + follower counts. All routes operate on the authenticated
// user as the follower (req.user._id); the target is :userId in the path.
const mongoose = require("mongoose");
const Follow = require("../models/followModel");
const { createNotification } = require("../utils/notify");

const User = () => mongoose.models.users;

// POST /api/v1/follow/:userId — toggle follow on/off (idempotent).
// Returns { following, followersCount }. Self-follow is rejected. A "follow"
// also drops a `follow` notification on the author's bell (best-effort).
exports.toggleFollow = async (req, res) => {
  try {
    const follower = req.user._id;
    const followee = req.params.userId;
    if (String(follower) === String(followee)) {
      return res.status(400).json({ success: false, message: "You can't follow yourself." });
    }
    const target = await User().findById(followee).select("_id username").lean();
    if (!target) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const existing = await Follow.findOne({ follower, followee });
    if (existing) {
      await existing.deleteOne();
      const followersCount = await Follow.countDocuments({ followee });
      return res.status(200).json({ success: true, following: false, followersCount });
    }

    await Follow.create({ follower, followee });
    // Best-effort "X started following you" notification to the author.
    const me = await User().findById(follower).select("username").lean();
    createNotification(
      {
        recipient: followee,
        actor: follower,
        type: "follow",
        text: `👋 ${me ? me.username : "Someone"} started following you.`,
      }
    ).catch(() => {});
    const followersCount = await Follow.countDocuments({ followee });
    return res.status(200).json({ success: true, following: true, followersCount });
  } catch (err) {
    console.error("toggleFollow error:", err.message);
    return res.status(500).json({ success: false, message: "Couldn't update follow." });
  }
};

// GET /api/v1/follow/info/:userId — counts + whether the current user follows.
//   -> { followersCount, followingCount, isFollowing }
exports.getFollowInfo = async (req, res) => {
  try {
    const me = req.user._id;
    const target = req.params.userId;
    const [followersCount, followingCount, isFollowing] = await Promise.all([
      Follow.countDocuments({ followee: target }),
      Follow.countDocuments({ follower: target }),
      String(me) === String(target) ? Promise.resolve(false) : Follow.exists({ follower: me, followee: target }),
    ]);
    return res.status(200).json({
      success: true,
      followersCount,
      followingCount,
      isFollowing: !!isFollowing,
    });
  } catch (err) {
    console.error("getFollowInfo error:", err.message);
    return res.status(500).json({ success: false, message: "Couldn't load follow info." });
  }
};

// Generic list helper for followers / following. Returns public projections.
const listEdges = async (res, filter, key) => {
  try {
    const edges = await Follow.find(filter).sort({ createdAt: -1 }).lean();
    const ids = edges.map((e) => e[key]);
    const users = ids.length
      ? await User().find({ _id: { $in: ids } })
          .select("username profile_image bio points level")
          .lean()
      : [];
    // Preserve the follow order (find doesn't guarantee $in order).
    const byId = new Map(users.map((u) => [String(u._id), u]));
    const ordered = ids.map((id) => byId.get(String(id))).filter(Boolean);
    return res.status(200).json({ success: true, count: ordered.length, users: ordered });
  } catch (err) {
    console.error("listEdges error:", err.message);
    return res.status(500).json({ success: false, message: "Couldn't load list." });
  }
};

// GET /api/v1/follow/followers/:userId — who follows this user.
exports.listFollowers = (req, res) => listEdges(res, { followee: req.params.userId }, "follower");
// GET /api/v1/follow/following/:userId — whom this user follows.
exports.listFollowing = (req, res) => listEdges(res, { follower: req.params.userId }, "followee");