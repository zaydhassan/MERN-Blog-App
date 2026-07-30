const mongoose = require("mongoose");

// Append-only ledger of every point change. Written by `awardActivity` on each
// award/reversal so the leaderboard can sum points within a time window
// (weekly / monthly tabs). Best-effort: a ledger write failure is logged and
// swallowed — it must never roll back or block the parent award.
const pointEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    activityType: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Leaderboard window aggregation: filter by `created_at >= windowStart`,
// $group by `user` summing `points`, sorted desc.
pointEventSchema.index({ user: 1, created_at: -1 });

const PointEvent =
  mongoose.models.PointEvent ||
  mongoose.model("PointEvent", pointEventSchema);

module.exports = PointEvent;