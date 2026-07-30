import DOMPurify from "dompurify";

/**
 * Sanitize untrusted HTML before rendering with dangerouslySetInnerHTML.
 * Blog bodies come from the Quill editor as raw HTML, so any writer could
 * otherwise inject <script> / onerror handlers that execute in every
 * reader's browser (stored XSS). DOMPurify strips those while keeping
 * safe formatting (bold, lists, images, headings, etc.).
 */
export const sanitizeHtml = (dirty) => {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    // Allow common rich-text tags; block forms/objects that could be abused.
    FORBID_TAGS: ["form", "input", "button", "style", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
  });
};

/**
 * Strip HTML tags from a rich-text string and return plain text — used to
 * estimate reading time from a blog body without counting markup as words.
 * Runs after sanitize so the input is already trusted-ish, but a regex strip
 * is safe regardless (we never render the result as HTML).
 */
export const stripHtml = (html) => {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/** Estimated reading time in minutes (200 wpm), minimum 1. */
export const readingTime = (html) => {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};