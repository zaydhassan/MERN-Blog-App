// Reusable nodemailer transporter, decoupled from the inline one in server.js
// (which is closure-scoped to the newsletter/contact routes and not
// importable). Built once from EMAIL_USER / EMAIL_PASS. If those aren't set,
// `sendEmail` resolves false instead of throwing so callers (new-post
// alerts) can no-op cleanly in dev without a configured mailbox.
const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return transporter;
};

// sendEmail({ to, subject, html, text }) — promise resolves to { ok, info? }.
// Never rejects: a misconfigured mailbox or send error logs + resolves ok=false
// so a failed alert never breaks the parent publish flow.
const sendEmail = ({ to, subject, html, text }) =>
  new Promise((resolve) => {
    const t = getTransporter();
    if (!t || !to) {
      if (!t) console.warn("mailer: EMAIL_USER/EMAIL_PASS not set — skipping send.");
      return resolve({ ok: false });
    }
    t.sendMail(
      { from: process.env.EMAIL_USER, to, subject, html, text },
      (error, info) => {
        if (error) {
          console.error("mailer send error:", error.message);
          return resolve({ ok: false });
        }
        resolve({ ok: true, info });
      }
    );
  });

module.exports = { sendEmail, getTransporter };