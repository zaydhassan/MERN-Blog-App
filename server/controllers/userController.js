const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const Reward = require("../models/rewardModel");
const PointEvent = require("../models/pointEventModel");
const {
  publicUser,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshCookieOptions,
} = require("../utils/tokenUtils");

// The multer configuration that used to live here is gone — uploads now go
// through the shared, hardened config in ../config/upload (mounted on the
// route). This controller only reads the already-validated req.file.
exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  return res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    imageUrl,
  });
};
exports.registerController = async (req, res) => {
  try {
    const { username, email, password, bio, profile_image } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Role is intentionally NOT accepted from the client — that was a
    // self-privilege-escalation vector. New users are always Readers; only
    // an Admin can promote via the protected update endpoint.
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role: "Reader",
      bio,
      profile_image,
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(201).json({
      success: true,
      message: "New user created",
      user: publicUser(user),
      accessToken,
    });
  } catch (error) {
    // Duplicate-key race on the email unique index → friendly 409.
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "A user with this email already exists" });
    }
    console.error("Register error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error creating user" });
  }
};

exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { username, email, bio, profile_image, password } = req.body;

  // Ownership: a user may only edit their own profile. Admins may edit
  // anyone. Role is never accepted from the body here — promotion must go
  // through a dedicated admin endpoint (not yet wired).
  if (req.user.role !== "Admin" && String(userId) !== String(req.user._id)) {
    return res
      .status(403)
      .json({ success: false, message: "You can only update your own profile." });
  }

  try {
    const updatedFields = { username, email, bio, profile_image };
    // Drop undefined keys so we don't clobber existing values with null.
    Object.keys(updatedFields).forEach(
      (k) => updatedFields[k] === undefined && delete updatedFields[k]
    );

    if (password && password.trim() !== "") {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: publicUser(updatedUser),
    });
  } catch (error) {
    console.error("Update user error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error updating user" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // select:false on the model already hides the hash; -password is
    // defense-in-depth in case that ever changes.
    const users = await userModel.find({}).select("-password");
    return res.status(200).json({
      userCount: users.length,
      success: true,
      message: "all users data",
      users,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching users" });
  }
};

exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Explicitly select the hash (the model hides it by default).
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      // Deliberately generic — don't reveal whether the email exists.
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // OAuth-only accounts have no password — they must sign in via Google.
    // bcrypt.compare on a null hash would throw, so guard explicitly.
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "This account uses Google. Please continue with Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: publicUser(user),
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error during login" });
  }
};

// Mint a new access token from the httpOnly refresh-token cookie.
exports.refreshTokenController = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token required." });
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired refresh token." });
    }

    const user = await userModel.findById(payload.sub);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists." });
    }

    const accessToken = signAccessToken(user);
    // Rotate the refresh token to detect reuse.
    const newRefresh = signRefreshToken(user);
    res.cookie("refreshToken", newRefresh, refreshCookieOptions);

    return res
      .status(200)
      .json({ success: true, accessToken, user: publicUser(user) });
  } catch (error) {
    console.error("Refresh error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error refreshing token." });
  }
};

// Clear the refresh-token cookie. The client drops its access token.
exports.logoutController = async (req, res) => {
  try {
    res.clearCookie("refreshToken", { path: "/api/v1/user" });
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error logging out" });
  }
};

exports.listRewards = async (req, res) => {
    console.log("Fetching rewards..."); 

    try {
        const rewards = await Reward.find({});
        console.log("Rewards found:", rewards);
        res.json({ success: true, rewards });
    } catch (error) {
        console.error("Error fetching rewards:", error);
        res.status(500).json({ success: false, message: "Failed to list rewards", error });
    }
};

exports.redeemPoints = async (req, res) => {
  const { rewardId } = req.body;
  // Always redeem for the authenticated user — never trust a body userId.
  const userId = req.user._id;

  try {
    if (!mongoose.Types.ObjectId.isValid(rewardId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid reward ID format" });
    }

    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ success: false, message: "Reward not found" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.points < reward.costInPoints) {
      return res.status(400).json({ success: false, message: "Not enough points" });
    }

    user.points -= reward.costInPoints;
    user.redeemedRewards.push({ rewardId: reward._id });

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Reward redeemed successfully", pointsLeft: user.points });
  } catch (error) {
    console.error("Error redeeming points:", error.message);
    res.status(500).json({ success: false, message: "Error redeeming points" });
  }
};

// getLevel / getBadges and the client-triggered updateUserPoints /
// updateLikePoints controllers have been removed. Points are now awarded
// server-side by utils/points.js inside the like / comment / publish flows
// (those endpoints were trivially farmable — a user could POST
// update-points in a loop to gain unlimited points).

exports.getLeaderboard = async (req, res) => {
  try {
    const period = (req.query.period || "all").toLowerCase();
    const valid = { all: "all", week: "week", month: "month" };
    const periodKey = valid[period] || "all";

    let topWriters, topReaders;

    if (periodKey === "all") {
      // All-time: read the denormalized points totals straight off the user
      // docs (the compound {role, points} index serves this).
      [topWriters, topReaders] = await Promise.all([
        userModel.find({ role: "Writer", points: { $gt: 0 } }).sort({ points: -1 }).limit(10),
        userModel.find({ role: "Reader", points: { $gt: 0 } }).sort({ points: -1 }).limit(10),
      ]);
    } else {
      // Time-windowed: sum the append-only PointEvent ledger over the window,
      // join the user for display fields, then split by role. Window starts:
      // week = now−7d, month = now−30d.
      const days = periodKey === "week" ? 7 : 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const ranked = await PointEvent.aggregate([
        { $match: { created_at: { $gte: since } } },
        { $group: { _id: "$user", points: { $sum: "$points" } } },
        { $match: { points: { $gt: 0 } } },
        { $sort: { points: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            points: 1,
            username: "$user.username",
            role: "$user.role",
            profile_image: "$user.profile_image",
            level: "$user.level",
            badges: "$user.badges",
          },
        },
      ]);

      topWriters = ranked.filter((u) => u.role === "Writer");
      topReaders = ranked.filter((u) => u.role === "Reader");
    }

    res.json({
      success: true,
      topWriters,
      topReaders,
      period: periodKey,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ success: false, message: "Error fetching leaderboard" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      user: {
        points: user.points,
        level: user.level,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Error fetching user data" });
  }
};