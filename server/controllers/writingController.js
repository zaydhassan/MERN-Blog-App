// Writing streak + daily goal HTTP handlers. All routes are self-service and
// operate on the authenticated user (req.user._id) — a body/client-supplied
// userId is never trusted.
const mongoose = require("mongoose");
const { computeWritingStats, dayOf } = require("../utils/writing");
const WritingActivity = require("../models/writingActivityModel");

// GET /api/v1/writing/stats
//   -> { todayWords, dailyGoal, currentStreak, longestStreak, history }
// history is the last ~12 weeks (one entry per day, oldest→newest, missing
// days => 0 words) for the contribution heatmap.
exports.getWritingStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const User = mongoose.models.users;
    const user = await User.findById(userId).select("dailyGoal").lean();
    const { currentStreak, longestStreak, history } = await computeWritingStats(userId, 84);
    const today = dayOf();
    const todayDoc = await WritingActivity.findOne({ user: userId, day: today }).lean();
    return res.status(200).json({
      success: true,
      todayWords: todayDoc ? todayDoc.words : 0,
      dailyGoal: user && user.dailyGoal ? user.dailyGoal : 500,
      currentStreak,
      longestStreak,
      history,
    });
  } catch (err) {
    console.error("getWritingStats error:", err.message);
    return res.status(500).json({ success: false, message: "Couldn't load writing stats." });
  }
};

// PUT /api/v1/writing/goal  body: { goal }
// Sets the author's daily word-count goal. Clamped to 50–10000.
exports.setDailyGoal = async (req, res) => {
  try {
    const goal = Number(req.body.goal);
    if (!Number.isFinite(goal) || goal < 50 || goal > 10000) {
      return res.status(400).json({ success: false, message: "Goal must be between 50 and 10,000 words." });
    }
    const User = mongoose.models.users;
    const user = await User.findByIdAndUpdate(req.user._id, { dailyGoal: goal }, { new: true }).select("dailyGoal");
    return res.status(200).json({ success: true, dailyGoal: user.dailyGoal, message: "Daily goal updated." });
  } catch (err) {
    console.error("setDailyGoal error:", err.message);
    return res.status(500).json({ success: false, message: "Couldn't update daily goal." });
  }
};