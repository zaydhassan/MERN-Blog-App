// Single shared upload configuration for the whole app. Replaces the three
// ad-hoc multer configs that previously lived in userRoutes, blogRoutes and
// userController — each with its own (looser) limits and naming scheme.
//
// Hardening:
//  - MIME allowlist (images only)
//  - 5 MB file-size cap (overridable via MAX_UPLOAD_MB)
//  - UUID filenames (no user-controlled names on disk)
//  - post-save magic-byte verification (rejects files whose bytes don't match
//    their declared type, e.g. a .exe renamed to .jpg)

const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB) || 5;
const MAX_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Extension keyed by real mimetype, so the on-disk name reflects the content
// (not the user-supplied originalname, which is discarded).
const EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomUUID() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) return cb(null, true);
  return cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed."), false);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter,
});

// Read the first bytes of the saved file and confirm they match an allowed
// image signature. Run this AFTER upload.single(). If the content is wrong,
// delete the file and reject the request — do not keep attacker-controlled
// bytes on disk.
const matchesMagic = (buf, mime) => {
  const b = buf;
  switch (mime) {
    case "image/jpeg":
      return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case "image/png":
      return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
    case "image/gif":
      return b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38;
    case "image/webp":
      // RIFF container; bytes 8-11 must spell "WEBP".
      return (
        b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b.slice(8, 12).toString("ascii") === "WEBP"
      );
    default:
      return false;
  }
};

const validateImageFile = (req, res, next) => {
  if (!req.file) return next();
  fs.readFile(req.file.path, (err, buf) => {
    if (err) return next(err);
    if (!matchesMagic(buf, req.file.mimetype)) {
      fs.unlink(req.file.path, () => {});
      return res
        .status(400)
        .json({ success: false, message: "Invalid image file: content does not match its type." });
    }
    next();
  });
};

module.exports = { upload, validateImageFile, MAX_BYTES, ALLOWED_MIMES };