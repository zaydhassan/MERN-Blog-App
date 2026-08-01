// Lightweight scheduled-publish promotion loop.
//
// No external cron dependency: a single setInterval ticks every minute and
// asks blogController.promoteScheduledBlogs() to flip any due scheduled drafts
// to Published. The promotion logic itself (point award, notification,
// idempotency) lives in the controller; this file only owns the timing.
//
// Multi-instance gate: in a horizontally-scaled deployment every instance
// would run its own interval and all of them would race on the same due
// posts (the controller's conditional updateOne prevents double awards, but
// the redundant sweeps still waste DB round-trips). Set RUN_SCHEDULER=false
// on all instances EXCEPT one to run the sweep on a single instance only.
// Unset / truthy → start (single-instance dev keeps working out of the box).
//
// Overlap guard: if a tick is still running when the next interval fires, the
// new tick is skipped — so a slow DB never piles up concurrent promotions.
// startScheduler() is idempotent (safe to call more than once).

const { promoteScheduledBlogs } = require("../controllers/blogController");

let timer = null;
let running = false;

// Truthy unless explicitly disabled. Accepts "false"/"0"/"no" (any case) as
// "off"; any other value (including unset) means "on".
const schedulerEnabled = (() => {
  const v = process.env.RUN_SCHEDULER;
  if (v === undefined) return true;
  return !["false", "0", "no", "off"].includes(String(v).toLowerCase());
})();

const tick = async () => {
  if (running) return;
  running = true;
  try {
    await promoteScheduledBlogs();
  } catch (err) {
    console.error("Scheduler tick error:", err.message);
  } finally {
    running = false;
  }
};

const startScheduler = (intervalMs = 60 * 1000) => {
  if (timer) return; // already started — don't stack intervals
  if (!schedulerEnabled) {
    console.log("Scheduled-publish scheduler DISABLED via RUN_SCHEDULER=false.");
    return;
  }
  // Run once immediately so posts that came due while the server was down are
  // promoted on boot instead of waiting up to a minute.
  tick();
  timer = setInterval(tick, intervalMs);
  // Don't let this timer be the only thing keeping the process alive; the
  // Express HTTP server already does that. Keeps `Ctrl-C` / SIGTERM clean.
  if (typeof timer.unref === "function") timer.unref();
  console.log("Scheduled-publish scheduler started (every 60s).");
};

const stopScheduler = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

module.exports = { startScheduler, stopScheduler, schedulerEnabled };