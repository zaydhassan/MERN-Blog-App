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
  writer: { publishArticle: 50, receiveLike: 10, receiveComment: 5 },
  reader: { readArticle: 10, likeArticle: 5, commentArticle: 10, shareArticle: 15 },
};

const getLevel = (points) => {
  if (points >= 3000) return "Master Storyteller";
  if (points >= 1000) return "Influencer";
  if (points >= 500) return "Engaged Contributor";
  return "Aspiring Wordsmith";
};

const getBadges = (points) => {
  const badges = [];
  if (points >= 500) badges.push("Engaged Reader");
  if (points >= 1000) badges.push("Top Contributor");
  if (points >= 5000) badges.push("Elite Writer");
  return badges;
};

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

  user.points = Math.max(0, user.points + delta);
  user.level = getLevel(user.points);
  user.badges = getBadges(user.points);

  if (session) await user.save({ session });
  else await user.save();

  // Append-only ledger for time-windowed leaderboard aggregations.
  await writeLedger(userId, activityType, delta, session);

  const leveledUp = user.level !== prevLevel && direction > 0;
  const newBadges = direction > 0 ? user.badges.filter((b) => !prevBadges.includes(b)) : [];

  const state = {
    points: user.points,
    level: user.level,
    badges: user.badges,
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