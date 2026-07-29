// Server-side HTML sanitization for stored rich text (blog descriptions).
// This is the durable fix for stored XSS: sanitize on WRITE so malicious
// markup never reaches the database, regardless of which client renders it.
// The client also sanitizes on render (utils/sanitize.js) as defense in depth.
//
// Uses isomorphic-dompurify (DOMPurify + jsdom) so the same sanitizer runs in
// Node. The config mirrors the client's so behavior is consistent.
const { sanitize } = require("isomorphic-dompurify");

const sanitizeHtml = (dirty) => {
  if (!dirty) return "";
  return sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["form", "input", "button", "style", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
  });
};

module.exports = { sanitizeHtml };