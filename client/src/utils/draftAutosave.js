// Client-side auto-save + draft recovery for the blog editors.
//
// Persists in-progress editor state to localStorage so a browser crash or
// accidental refresh doesn't lose the writer's work. Local-only (single
// device); cross-device server autosave is a separate, future feature.
//
// Keys are scoped per user + per context so a shared machine never
// cross-contaminates drafts:
//   new blog:  blogDraft:new:<userId>
//   edit blog: blogDraft:edit:<userId>:<blogId>
// A null userId means "skip persistence" — we never write anonymous keys.

export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SCHEMA_VERSION = 1;
export const DEBOUNCE_MS = 1500;

export const newDraftKey = (userId) => `blogDraft:new:${userId}`;
export const editDraftKey = (userId, blogId) => `blogDraft:edit:${userId}:${blogId}`;

// Write a draft payload under `key`. Never throws: a QuotaExceededError (or any
// other storage failure) is swallowed so the editor keeps working — it just
// stops auto-saving. Only URL strings are stored for images; the uploaded
// File object is intentionally NOT persisted (not serializable across sessions).
export const saveDraft = (key, payload) => {
  if (!key) return;
  try {
    const record = JSON.stringify({
      v: SCHEMA_VERSION,
      savedAt: Date.now(),
      payload,
    });
    localStorage.setItem(key, record);
  } catch (err) {
    // Quota exceeded / storage disabled — editor continues without autosave.
  }
};

// Read and return a draft for `key` as `{ savedAt, payload }`, or null if
// absent/expired/corrupt. Expired drafts (older than DRAFT_TTL_MS) and
// unparseable entries are deleted on load so they don't haunt the writer with
// a stale recovery banner. `savedAt` is exposed so the recovery banner can
// render "from N min ago".
export const loadDraft = (key) => {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const record = JSON.parse(raw);
    if (!record || typeof record.savedAt !== "number") {
      localStorage.removeItem(key);
      return null;
    }
    if (Date.now() - record.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return { savedAt: record.savedAt, payload: record.payload || null };
  } catch (err) {
    // Corrupt JSON — clear it so it never surfaces as a recovery prompt.
    try {
      localStorage.removeItem(key);
    } catch {}
    return null;
  }
};

export const clearDraft = (key) => {
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch {}
};

// Generic debounce for the save path. `flush()` writes immediately (used by the
// beforeunload handler and on successful submit); `cancel()` drops a pending
// timer. The `Date.now()`-free clock isn't a concern here (client runtime).
export const makeDebouncedSave = (fn, delay = DEBOUNCE_MS) => {
  let timer = null;
  const trigger = (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delay);
  };
  const flush = (...args) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return { trigger, flush, cancel };
};

// Reconcile the tags-shape mismatch between the two editors:
// CreateBlog stores tags as a comma-separated string; EditBlog as an array.
// `mode` is the shape the consuming page expects.
export const normalizeTags = (stored, mode) => {
  if (stored == null) return mode === "array" ? [] : "";
  if (mode === "array") {
    if (Array.isArray(stored)) return stored.map(String);
    return String(stored)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  // string mode
  if (Array.isArray(stored)) return stored.join(", ");
  return String(stored);
};

// True when every persisted field is blank — used to avoid writing a draft slot
// the first time someone opens an empty editor.
export const isDraftEmpty = (payload) => {
  if (!payload) return true;
  const { title = "", description = "", category = "", tags = "", image = "" } = payload;
  const text = (s) => (s == null ? "" : String(s)).replace(/<\/?[^>]+(>|$)/g, "").trim();
  return (
    !String(title).trim() &&
    !text(description) &&
    !String(category).trim() &&
    !(Array.isArray(tags) ? tags.length : String(tags).trim()) &&
    !String(image).trim()
  );
};