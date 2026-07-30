// Zod schemas for request validation. Validating on the server is the real
// defense — client checks are convenience only. Each schema also coerces
// (e.g. lowercases email) so controllers can trust the shape.
const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const email = z.string().trim().email("Invalid email").max(254).toLowerCase();

// New accounts must use a reasonably strong password. Existing legacy users
// logging in are validated leniently (loginSchema) so we don't lock them out.
const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_ -]+$/, "Username may only contain letters, numbers, spaces, _ and -"),
  email,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  bio: z.string().max(500).optional(),
  profile_image: z.string().max(2048).optional(),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(128),
});

// Google (Firebase) OAuth token exchange — the client posts the Firebase ID
// token from signInWithPopup; the server verifies it with firebase-admin.
const googleAuthSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
});

const updateUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_ -]+$/)
    .optional(),
  email: z.string().trim().email().max(254).toLowerCase().optional(),
  bio: z.string().max(500).optional(),
  profile_image: z.string().max(2048).optional(),
  password: z.string().min(8).max(128).optional(),
});

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email,
  message: z.string().trim().min(1, "Message is required").max(5000),
});

const newsletterSchema = z.object({
  email,
});

const commentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(5000),
  blog_id: z.string().regex(objectIdRegex, "Invalid blog id"),
});

// Blog create uses multipart/form-data, so all text fields arrive as strings.
const blogCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  category: z.string().trim().min(1).max(50),
  status: z.enum(["Draft", "Published"]).optional(),
});

// Admin role change. The role enum matches userModel.
const promoteUserSchema = z.object({
  role: z.enum(["Reader", "Writer", "Admin"]),
});

// Bookmark toggle — only the blog id is client-supplied; the user comes from
// auth middleware.
const bookmarkSchema = z.object({
  blog: z.string().regex(objectIdRegex, "Invalid blog id"),
});

module.exports = {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  updateUserSchema,
  contactSchema,
  newsletterSchema,
  commentSchema,
  blogCreateSchema,
  promoteUserSchema,
  bookmarkSchema,
};