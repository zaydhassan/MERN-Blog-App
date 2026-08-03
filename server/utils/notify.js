// Best-effort notification creator. Used by the like / comment / reply flows
// to notify the relevant user. A failure here is logged and swallowed — it
// must never block or roll back the parent operation (the like/comment still
// succeeded). Pass an optional mongoose `session` to make the write atomic
// with the caller's transaction.
const Notification = require("../models/notificationModel");

const createNotification = async ({ recipient, actor, type, blog = null, text = "" }, session = null) => {
  try {
    if (session) {
      await Notification.create([{ recipient, actor, type, blog, text }], { session });
    } else {
      await Notification.create({ recipient, actor, type, blog, text });
    }
  } catch (err) {
    if (session) throw err; // inside a transaction — stay atomic.
    console.error("Notification create failed:", err.message);
  }
};

module.exports = { createNotification };