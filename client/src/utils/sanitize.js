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