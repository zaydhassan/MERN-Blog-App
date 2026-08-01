const Reward = require("../models/rewardModel");
const User = require("../models/userModel");
const PointEvent = require("../models/pointEventModel");
const { getLevel, getBadges } = require("../utils/points");

// GET /api/v1/rewards — public reward catalog, cheapest first.
// The Rewards page and the Profile page both read this list.
exports.getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find().sort({ costInPoints: 1 }).lean();
    res.status(200).json({ success: true, rewards });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch rewards." });
  }
};

// POST /api/v1/rewards/redeem — spend points on a reward.
// Uses req.user._id (set by authenticateUser), NOT the client-supplied userId,
// so a logged-in user can only spend their own balance.
//
// Atomicity: the balance check and the decrement happen in a single
// conditional findOneAndUpdate. The query filter `{ points: { $gte: cost } }`
// is what makes this safe — two concurrent redeem requests both see "enough"
// under the old read-check-save path and each decrement, driving the balance
// negative (double-spend). With the conditional update, MongoDB only applies
// the decrement to a document that still has enough points at apply time, so
// the second concurrent request matches zero docs and is rejected. Level and
// badges are recomputed from the new total in a follow-up targeted $set (only
// those two fields, never points) so a concurrent award isn't clobbered.
exports.redeemReward = async (req, res) => {
  try {
    const { rewardId } = req.body;
    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ success: false, message: "Reward not found." });
    }

    const updated = await User.findOneAndUpdate(
      { _id: req.user._id, points: { $gte: reward.costInPoints } },
      {
        $inc: { points: -reward.costInPoints },
        $push: {
          redeemedRewards: { rewardId: reward._id, redeemedOn: new Date() },
        },
      },
      { new: true }
    );

    if (!updated) {
      // Either the user vanished or — the common case — the conditional match
      // failed because the balance was below the cost (possibly after a
      // concurrent redeem). Re-read for an accurate "you have X" message.
      const fresh = await User.findById(req.user._id).select("points").lean();
      return res.status(400).json({
        success: false,
        message: `Not enough points. You need ${reward.costInPoints}, you have ${
          fresh ? fresh.points || 0 : 0
        }.`,
      });
    }

    // Recompute derived level/badges from the new total (deterministic).
    const level = getLevel(updated.points);
    const badges = getBadges(updated.points);
    await User.updateOne({ _id: updated._id }, { $set: { level, badges } });

    // Best-effort ledger entry for the redemption (audit trail). Never blocks.
    try {
      await PointEvent.create({
        user: req.user._id,
        activityType: "redeemReward",
        points: -reward.costInPoints,
      });
    } catch (ledgerErr) {
      console.error("Redemption ledger write failed:", ledgerErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Reward redeemed successfully!",
      remainingPoints: updated.points,
      level,
      badges,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to redeem reward." });
  }
};