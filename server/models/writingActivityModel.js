const mongoose = require("mongoose");

// Per-day writing ledger that powers the writing streak + daily word-count
// goal. One document per (user, day) where `day` is the integer count of days
// since the Unix epoch (UTC) — using an integer day number (not a Date) makes
// streak math trivial: a streak is just a run of consecutive integers.
//
// `words` is the cumulative word count the author wrote that day. It is
// incremented (never replaced) by `recordWords` in utils/writing.js, which is
// called from the blog create / update flows. Only NET new words are counted
// on an update (max(0, newWords - previousWords)) so re-saving the same post
// never inflates the count.
const writingActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    // Days since the Unix epoch (UTC). Math.floor(Date.now() / 86400000).
    day: {
      type: Number,
      required: true,
    },
    words: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// One row per user per day. $inc upserts rely on this uniqueness.
writingActivitySchema.index({ user: 1, day: 1 }, { unique: true });
// Streak / history queries scan a user's recent days in order.
writingActivitySchema.index({ user: 1, day: -1 });

const WritingActivity =
  mongoose.models.WritingActivity ||
  mongoose.model("WritingActivity", writingActivitySchema);

module.exports = WritingActivity;