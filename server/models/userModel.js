const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: true
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      // Optional: accounts created via OAuth (Google) have no password.
      // loginController guards against a null hash before bcrypt.compare.
      // Never return the hash in queries by default. Any code that needs
      // the hash (login) must explicitly `.select("+password")`.
      select: false,
    },
    // OAuth account linkage. `provider` is "google" (or null for email/password
    // accounts); `providerId` is the Firebase UID from the verified ID token.
    provider: { type: String, default: null },
    providerId: { type: String, default: null },
    role: {
      type: String,
      required: [true, "role is required"],
      enum: ['Reader', 'Writer', 'Admin'],
      default: 'Reader'  
    },
    bio: {
      type: String,
      default: ""
    },
    profile_image: {
      type: String,
      default: ""
    },
    // The denormalized `blogs: [ObjectId]` array that used to live here is
    // gone — blogModel.user is the source of truth and is queried directly
    // (userBlogController). The array was never read by the client and was
    // only maintained by a push in createBlogController, now removed.
    points: {
      type: Number,
      default: 0
    },
    level: {
      type: String,
      default: "Beginner"
    },
    badges: {
      type: [String],
      default: []
    },
    redeemedRewards: [
      {
        rewardId: {
          type: mongoose.Types.ObjectId,
          ref: "Reward",
        },
        redeemedOn: {
          type: Date,
          default: Date.now,
        }
      }
    ],
    // Daily word-count goal for the writing streak feature (utils/writing.js).
    // The author sets it from the Profile page; default 500 words/day. Clamped
    // server-side on update (50–10000) so a junk value can't break the goal
    // progress bar or award points repeatedly on a near-zero goal.
    dailyGoal: {
      type: Number,
      default: 500,
      min: 50,
      max: 10000,
    },
  },
  { timestamps: true,  collection: "users" }  
);

// Compound index for the leaderboard query (filter by role, sort by points).
userSchema.index({ role: 1, points: -1 });

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;