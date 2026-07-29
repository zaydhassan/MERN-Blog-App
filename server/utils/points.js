// Centralized point-awarding logic. Points are now awarded server-side inside
// the like / comment / publish flows (see the controllers) instead of via
// client-triggered /update-points endpoints, which were trivially farmable.
//
// Award amounts are role-scoped, matching the previous client-triggered map:
//   writer: publishArticle 50, receiveLike 10, receiveComment 5
//   reader: readArticle 10, likeArticle 5, commentArticle 10, shareArticle 15
// Admins earn nothing (they don't farm engagement points).
const userModel = require("../models/userModel");

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

// Award (or reverse, with direction = -1) the points for an activity to a
// user. Runs inside the caller's transaction when a session is passed. Points
// never go below 0. Returns the updated { points, level, badges } or null if
// the user wasn't found / the role has no value for that activity.
const awardActivity = async (userId, activityType, direction = 1, session = null) => {
  const user = session
    ? await userModel.findById(userId).session(session)
    : await userModel.findById(userId);
  if (!user) return null;

  const roleKey = String(user.role).toLowerCase();
  const base = (POINT_VALUES[roleKey] && POINT_VALUES[roleKey][activityType]) || 0;
  if (!base) {
    return { points: user.points, level: user.level, badges: user.badges };
  }

  user.points = Math.max(0, user.points + base * direction);
  user.level = getLevel(user.points);
  user.badges = getBadges(user.points);

  if (session) await user.save({ session });
  else await user.save();

  return { points: user.points, level: user.level, badges: user.badges };
};

module.exports = { POINT_VALUES, getLevel, getBadges, awardActivity };