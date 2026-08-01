// Fan out a "new post" alert to an author's followers when a post goes live.
// Two channels, both best-effort (never block / never throw on the publish):
//   1. in-app Notification (type "newPost") for every follower — reuses the
//      existing notification center + bell.
//   2. email to followers who have an email address — via utils/mailer.js.
//
// Called from createBlogController (publish now), updateBlogController
// (Draft→Published), and promoteScheduledBlogs (scheduled post due). When a
// session is passed the notifications are written inside the caller's
// transaction; emails always fire-and-forget after (a mail send must never
// hold a DB transaction open).
const mongoose = require("mongoose");
const Follow = require("../models/followModel");
const Notification = require("../models/notificationModel");
const { sendEmail } = require("./mailer");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
// Cap BOTH channels per publish. A huge follower list could create tens of
// thousands of Notification docs in one insertMany — risking a 16MB BSON cap
// throw and stalling the event loop. Capping in-app (and inserting in chunks)
// keeps the write bounded; the email cap also respects Gmail sending limits.
const MAX_INAPP_PER_PUBLISH = 1000;
const MAX_EMAILS_PER_PUBLISH = 100;
const INAPP_CHUNK = 250;

const notifyFollowersOfNewPost = async (authorId, blog, session = null) => {
  if (!authorId || !blog) return;
  try {
    const User = mongoose.models.users;
    const author = await User.findById(authorId).select("username").lean();
    const authorName = author ? author.username : "An author";
    const title = blog.title || "a new post";
    const postUrl = `${CLIENT_URL}/blog-details/${blog._id}`;

    const edges = await Follow.find({ followee: authorId })
      .select("follower -_id")
      .lean();
    const followerIds = edges.map((e) => e.follower);
    if (!followerIds.length) return;

    // 1. In-app notifications — capped + chunked so a large audience can't
    // produce a single insert that exceeds the 16MB BSON limit.
    const notifDocs = followerIds
      .slice(0, MAX_INAPP_PER_PUBLISH)
      .map((fid) => ({
        recipient: fid,
        actor: authorId,
        type: "newPost",
        blog: blog._id,
        text: `✍️ ${authorName} published a new post: "${title}"`,
      }));
    try {
      for (let i = 0; i < notifDocs.length; i += INAPP_CHUNK) {
        const chunk = notifDocs.slice(i, i + INAPP_CHUNK);
        if (session) await Notification.create(chunk, { session });
        else await Notification.create(chunk);
      }
    } catch (err) {
      if (session) throw err; // in-transaction: let the caller abort consistently.
      console.error("newPost notification write failed:", err.message);
    }

    // 2. Emails — fire-and-forget, capped, OUTSIDE any transaction.
    const emailTargets = followerIds.slice(0, MAX_EMAILS_PER_PUBLISH);
    const users = await User.find({ _id: { $in: emailTargets } })
      .select("email")
      .lean();
    const subject = `✍️ ${authorName} just published "${title}"`;
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#c2410c">${authorName} published a new post</h2>
        <p style="font-size:16px;color:#333"><strong>${title}</strong></p>
        <p style="color:#555">Read it on Inkwell:</p>
        <p><a href="${postUrl}" style="background:#c2410c;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Read the post →</a></p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #eee">
        <p style="font-size:12px;color:#999">You got this because you follow ${authorName}. Turn off email alerts anytime in your profile.</p>
      </div>`;
    users.forEach((u) => {
      if (u.email) sendEmail({ to: u.email, subject, html }).catch(() => {});
    });
  } catch (err) {
    if (session) throw err;
    console.error("notifyFollowersOfNewPost failed:", err.message);
  }
};

module.exports = { notifyFollowersOfNewPost, CLIENT_URL };