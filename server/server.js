const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");
const nodemailer = require("nodemailer");
const adminRoutes = require('./routes/adminRoutes');
const validate = require("./middleware/validate");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { contactSchema, newsletterSchema } = require("./validators/schemas");

dotenv.config();

const userRoutes = require("./routes/userRoutes");
const blogRoutes = require('./routes/blogRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { router: bookmarkRoutes, readingHistoryRouter } = require('./routes/bookmarkRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const path = require('path');

connectDB();

const app = express();

// Trust the proxy so req.protocol / req.ip are correct behind Render/Railway.
app.set("trust proxy", 1);

// Security headers.
app.use(helmet());

// CORS: allow only the configured client origin, with credentials so the
// httpOnly refresh-token cookie is sent cross-origin in production.
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/uploads", express.static("uploads"));

// General API rate limit (100 req / 15 min per IP).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", apiLimiter);

// Stricter limit on auth endpoints to blunt brute-force / abuse.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later." },
});
app.use("/api/v1/user/login", authLimiter);
app.use("/api/v1/user/register", authLimiter);
app.use("/api/v1/user/google", authLimiter);
app.use("/api/v1/user/refresh", authLimiter);

let subscribers = [];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateNewsletter = () => `
  <h1>✨ Welcome to Our Weekly Newsletter</h1>
  <h2>📝 Featured Blog</h2>
  <p><a href="https://yourblog.com/post-1">Mastering Responsive Design in 2025</a></p>
  <p>Learn the essentials of building adaptable websites for any device.</p>
  <h3>Thanks for joining us!</h3>
`;

app.post("/api/v1/newsletter/subscribe", validate(newsletterSchema), (req, res) => {
  const { email } = req.body;

  subscribers.push(email);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Our Newsletter!",
    html: generateNewsletter(),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ success: false, message: "Failed to send email." });
    }

    res.status(200).json({ success: true, message: "Subscribed successfully!" });
  });
});

app.post("/api/v1/contact", validate(contactSchema), (req, res) => {
  const { name, email, message } = req.body;

  // Strip CR/LF from the name so it can't inject headers into the email
  // subject (e.g. a name containing "\r\nBcc: ...").
  const safeName = name.replace(/[\r\n]/g, " ").trim();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New Contact Form Submission from ${safeName}`,
    text: `You received a new message from:

    Name: ${safeName}
    Email: ${email}
    Message: ${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ success: false, message: "Failed to send email." });
    }

    res.status(200).json({ success: true, message: "Message sent successfully!" });
  });
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/blog", blogRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/bookmarks", bookmarkRoutes);
app.use("/api/v1/reading-history", readingHistoryRouter);
app.use("/api/v1/analytics", analyticsRoutes);
app.use(express.static(path.join(__dirname, "../client/build")));

// SPA fallback. API routes that didn't match above should return JSON 404,
// not the React index.html (which used to masquerade as a "200 OK" response
// for every unknown /api/* path).
app.get("*", (req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ success: false, message: "API route not found." });
  }
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Central error handler — must be the last middleware. Any thrown/rejected
// error (including multer + Zod + Mongoose + JWT) is normalized to JSON here.
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(
      `Server Running on ${process.env.DEV_MODE} mode port no ${PORT}`
    );
});