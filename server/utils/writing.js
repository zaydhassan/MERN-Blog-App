// Writing streak + daily word-count goal engine.
//
// `recordWords` is called from the blog create / update flows (and could be
// called anywhere new writing happens). It increments a per-day word ledger
// (WritingActivity) and, the first time a day's total crosses the author's
// daily goal, awards gamification points + a system notification — once per
// day per crossing.
//
// Streaks are computed from the ledger: a "writing day" is any day with
// words > 0. The current streak runs back from today (or yesterday if the
// author hasn't written yet today — today's silence shouldn't break a live
// streak until the day actually ends). Days are stored as integers
// (days since epoch UTC) so consecutive-day math is just integer subtraction.

const mongoose = require("mongoose");
const WritingActivity = require("../models/writingActivityModel");
const { awardActivity } = require("./points");
const { createNotification } = require("./notify");

const MS_PER_DAY = 86400000;
const dayOf = (ts = Date.now()) => Math.floor(ts / MS_PER_DAY);

// Rough word count from a title + rich-text (HTML) body. Tags are stripped
// with a regex — this is a COUNT, not a security path, so a regex is fine
// (the body is already sanitized on write by the blog controller).
const countWords = (title = "", descriptionHtml = "") => {
  const text = `${title} ${String(descriptionHtml).replace(/<[^>]+>/g, " ")}`;
  return text.split(/\s+/).filter(Boolean).length;
};

// Increment the author's word ledger for today and award the daily-goal
// points the first time today's total crosses the goal. Best-effort: errors
// are logged and swallowed so they can never break the parent create/update.
// `session` is optional — when null (the blog flows call it after their
// transaction commits) each op runs standalone.
const recordWords = async (userId, words, session = null) => {
  if (!userId || !words || words <= 0) return null;
  try {
    const day = dayOf();
    const filter = { user: userId, day };

    // Atomic upsert: increment today's total and return the post-increment doc.
    // The unique (user, day) index serializes concurrent upserts on the same
    // day, so exactly one write is the one whose increment crosses the goal
    // boundary — preventing the double-award race the old read-then-inc-then-
    // award path had (two near-simultaneous writes could each see "below goal"
    // before either increment landed).
    const opts = { upsert: true, new: true };
    if (session) opts.session = session;
    const updated = await WritingActivity.findOneAndUpdate(
      filter,
      { $inc: { words }, $setOnInsert: { user: userId, day } },
      opts
    );
    const newWords = updated.words;
    // The pre-increment total for THIS write — used to test whether this
    // specific write was the one that crossed the goal.
    const prevWords = newWords - words;

    const user = await mongoose.models.users.findById(userId).session(session);
    const goal = user && user.dailyGoal ? user.dailyGoal : 0;
    if (goal > 0 && prevWords < goal && newWords >= goal) {
      const state = await awardActivity(userId, "dailyGoal", 1, session);
      await createNotification(
        {
          recipient: userId,
          actor: null,
          type: "system",
          text: `🎯 You hit your ${goal}-word daily writing goal! +25 points`,
        },
        session
      );
      return { prevWords, newWords, goal, awarded: state };
    }
    return { prevWords, newWords, goal, awarded: null };
  } catch (err) {
    console.error("recordWords failed:", err.message);
    return null;
  }
};

// Compute the current + longest streak and a recent-day history for the
// heatmap. `days` controls how many recent days of history to return
// (default 12 weeks). Returns { currentStreak, longestStreak, history }.
const computeWritingStats = async (userId, days = 84) => {
  const today = dayOf();
  const since = today - days + 1;
  const docs = await WritingActivity.find({ user: userId, day: { $gte: since } })
    .sort({ day: -1 })
    .lean();
  const written = new Set(docs.filter((d) => d.words > 0).map((d) => d.day));
  const wordsByDay = new Map(docs.map((d) => [d.day, d.words || 0]));

  // Current streak: count back from today (or yesterday if today is empty).
  let currentStreak = 0;
  let cursor = today;
  if (!written.has(cursor)) cursor = today - 1;
  while (written.has(cursor)) {
    currentStreak++;
    cursor--;
  }

  // Longest streak across the fetched window.
  let longestStreak = 0;
  let run = 0;
  let prev = null;
  const sortedDays = [...written].sort((a, b) => a - b);
  for (const d of sortedDays) {
    if (prev !== null && d === prev + 1) run++;
    else run = 1;
    if (run > longestStreak) longestStreak = run;
    prev = d;
  }

  // History: every day in the window (missing days => 0 words) oldest→newest.
  const history = [];
  for (let d = since; d <= today; d++) {
    history.push({ day: d, date: d * MS_PER_DAY, words: wordsByDay.get(d) || 0 });
  }

  return { currentStreak, longestStreak, history };
};

module.exports = { countWords, recordWords, computeWritingStats, dayOf, MS_PER_DAY };