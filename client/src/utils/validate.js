// Shared, framework-agnostic field validators. Each validator returns an
// error message string ("") when the value is valid, or a human-readable
// message when it is not. This keeps form-level validation DRY and lets
// every form wire the same helpers into MUI's `error` / `helperText` props.
//
// These mirror (loosely) the server-side Zod rules in server/validators, but
// are intentionally lenient on the client so we don't block submission for
// legacy users — the server remains the source of truth.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email) =>
  EMAIL_RE.test(String(email || "").trim());

// Required check. `label` is used to build a readable message.
export const validateRequired = (value, label = "This field") => {
  const v = String(value ?? "").trim();
  return v ? "" : `${label} is required.`;
};

export const validateEmail = (value) => {
  const v = String(value ?? "").trim();
  if (!v) return "Email is required.";
  return isValidEmail(v) ? "" : "Enter a valid email address.";
};

// Password validation. When `required` is false (e.g. an optional "change
// password" field), an empty value is accepted; otherwise min length applies.
export const validatePassword = (value, { min = 8, required = true } = {}) => {
  const v = String(value ?? "");
  if (!v) return required ? "Password is required." : "";
  if (v.length < min) return `Password must be at least ${min} characters.`;
  return "";
};

export const validateMinLength = (value, min, label = "This field") => {
  const v = String(value ?? "").trim();
  if (!v) return `${label} is required.`;
  if (v.length < min) return `${label} must be at least ${min} characters.`;
  return "";
};

// Run a map of { field: validator } and return a new errors object (only
// entries with non-empty messages). Returns null when there are no errors,
// which makes the submit guard a simple `if (errors) return;`.
export const validateFields = (values, validators) => {
  const errors = {};
  for (const [field, validator] of Object.entries(validators)) {
    const message = validator(values[field]);
    if (message) errors[field] = message;
  }
  return Object.keys(errors).length ? errors : null;
};