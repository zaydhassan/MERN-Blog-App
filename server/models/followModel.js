const mongoose = require("mongoose");

// Author-follow graph. `follower` follows `followee`. One doc per pair
// (unique index) so a toggle is an upsert/delete and duplicates can't pile up.
// Cascade-deleted from both sides: if either user is removed, their follow
// edges go too (wired in the delete-user flows).
const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    followee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

followSchema.index({ follower: 1, followee: 1 }, { unique: true });
// "Who follows X" and "Whom does Y follow" list queries.
followSchema.index({ followee: 1, createdAt: -1 });
followSchema.index({ follower: 1, createdAt: -1 });

const Follow =
  mongoose.models.Follow || mongoose.model("Follow", followSchema);

module.exports = Follow;