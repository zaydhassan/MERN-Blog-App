// Centralized point-awarding logic. Points are now awarded server-side inside
// the like / comment / publish flows (see the controllers) instead of via
// client-triggered /update-points endpoints, which were trivially farmable.
//
// Award amounts are role-scoped, matching the previous client-triggered map:
//   writer: publishArticle 50, receiveLike 10, receiveComment 5
//   reader: readArticle 10, likeArticle 5, commentArticle 10, shareArticle 15
// Admins earn nothing (they don't farm engagement points).
const userModel = require("../models/userModel");
const PointEvent = require("../models/pointEventModel");
const Notification = require("../models/notificationModel");

const POINT_VALUES = {
  writer: { publishArticle: 50, receiveLike: 10, receiveComment: 5, dailyGoal: 25 },
  reader: { readArticle: 10, likeArticle: 5, commentArticle: 10, shareArticle: 15 },
};

// Single source of truth for level/badge thresholds. getLevel/getBadges (for
// reads) and the atomic aggregation-pipeline builders (for writes, below) both
// derive from these arrays — change a threshold here and both stay in sync.
const LEVEL_THRESHOLDS = [
  { min: 3000, level: "Master Storyteller" },
  { min: 1000, level: "Influencer" },
  { min: 500, level: "Engaged Contributor" },
];
const BADGE_THRESHOLDS = [
  { min: 500, badge: "Engaged Reader" },
  { min: 1000, badge: "Top Contributor" },
  { min: 5000, badge: "Elite Writer" },
];
const BASE_LEVEL = "Aspiring Wordsmith";

const getLevel = (points) => {
  for (const t of LEVEL_THRESHOLDS) if (points >= t.min) return t.level;
  return BASE_LEVEL;
};

const getBadges = (points) =>
  BADGE_THRESHOLDS.filter((t) => points >= t.min).map((t) => t.badge);

// Aggregation-pipeline fragments that compute level/badges from `$points` in
// a single atomic updateOne/findOneAndUpdate. Used so the level/badges stored
// alongside a points change are always consistent with that change — no
// read-modify-save window where a concurrent award can lose an update.
const levelPipelineStage = () => ({
  $switch: {
    branches: LEVEL_THRESHOLDS.map((t) => ({
      case: { $gte: ["$points", t.min] },
      then: t.level,
    })),
    default: BASE_LEVEL,
  },
});
const badgesPipelineStage = () => ({
  $let: {
    vars: { pts: "$points" },
    in: {
      $concatArrays: BADGE_THRESHOLDS.map((t) => ({
        $cond: [{ $gte: ["$$pts", t.min] }, [t.badge], []],
      })),
    },
  },
});

// Best-effort ledger write. When a session is passed the event is written
// inside the caller's transaction (atomic with the award); without a session
// a failure is logged and swallowed so it can never break the parent flow.
const writeLedger = async (userId, activityType, delta, session) => {
  try {
    if (session) {
      await PointEvent.create([{ user: userId, activityType, points: delta }], { session });
    } else {
      await PointEvent.create({ user: userId, activityType, points: delta });
    }
  } catch (err) {
    if (session) throw err; // inside a transaction — let it abort consistently.
    console.error("PointEvent ledger write failed:", err.message);
  }
};

// Best-effort achievement notifications on level-up / new badge. Same session
// semantics as the ledger: in-transaction when a session is passed, swallowed
// otherwise. `actor` is null because these are system-generated milestones.
const writeAchievementNotifications = async (userId, state, session) => {
  if (!state.leveledUp && (!state.newBadges || !state.newBadges.length)) return;
  const docs = [];
  if (state.leveledUp) {
    docs.push({
      recipient: userId,
      actor: null,
      type: "levelUp",
      text: `🏆 You leveled up to "${state.level}"!`,
    });
  }
  for (const badge of state.newBadges || []) {
    docs.push({
      recipient: userId,
      actor: null,
      type: "badge",
      text: `🎖️ New badge unlocked: "${badge}"`,
    });
  }
  try {
    if (session) await Notification.create(docs, { session });
    else await Notification.create(docs);
  } catch (err) {
    if (session) throw err;
    console.error("Achievement notification write failed:", err.message);
  }
};

// Award (or reverse, with direction = -1) the points for an activity to a
// user. Runs inside the caller's transaction when a session is passed. Points
// never go below 0. Returns the updated state plus a delta the client uses to
// trigger level-up / badge celebrations:
//   { points, level, badges, prevLevel, prevBadges, leveledUp, newBadges }
// or null if the user wasn't found. For roles/activities worth 0 points the
// state is returned unchanged with leveledUp=false / newBadges=[].
const awardActivity = async (userId, activityType, direction = 1, session = null) => {
  // Read only the role (the delta depends on it). Role is effectively immutable
  // between this read and the update below, so reading it outside the atomic
  // update is safe — only `points` is the contended field, and that is mutated
  // by a single atomic aggregation-pipeline update below (no read-modify-save,
  // so concurrent awards can't lose updates or drive points negative).
  const user = session
    ? await userModel.findById(userId).session(session)
    : await userModel.findById(userId);
  if (!user) return null;

  const roleKey = String(user.role).toLowerCase();
  const base = (POINT_VALUES[roleKey] && POINT_VALUES[roleKey][activityType]) || 0;
  if (!base) {
    return {
      points: user.points,
      level: user.level,
      badges: user.badges,
      prevLevel: user.level,
      prevBadges: user.badges,
      leveledUp: false,
      newBadges: [],
    };
  }

  const delta = base * direction;
  const prevLevel = user.level;
  const prevBadges = Array.isArray(user.badges) ? [...user.badges] : [];

  // One atomic update: bump points (floored at 0) and recompute level/badges
  // from the new total in the same write. The pipeline stages run in order, so
  // the level/badges stages see the post-increment `$points`.
  const update = [
    { $set: { points: { $max: [0, { $add: ["$points", delta] }] } } },
    { $set: { level: levelPipelineStage() } },
    { $set: { badges: badgesPipelineStage() } },
  ];
  const opts = { new: true };
  if (session) opts.session = session;
  const updated = await userModel.findOneAndUpdate({ _id: userId }, update, opts);
  if (!updated) return null;

  // Append-only ledger for time-windowed leaderboard aggregations.
  await writeLedger(userId, activityType, delta, session);

  const leveledUp = updated.level !== prevLevel && direction > 0;
  const newBadges = direction > 0 ? updated.badges.filter((b) => !prevBadges.includes(b)) : [];

  const state = {
    points: updated.points,
    level: updated.level,
    badges: updated.badges,
    prevLevel,
    prevBadges,
    leveledUp,
    newBadges,
  };

  // Notify the user about level-ups / newly earned badges.
  await writeAchievementNotifications(userId, state, session);

  return state;
};

module.exports = { POINT_VALUES, getLevel, getBadges, awardActivity };