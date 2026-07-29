// validate(schema, source?) — Express middleware that parses req[source]
// (default "body") against a Zod schema. On success it replaces req[source]
// with the parsed/coerced value; on failure it returns a 400 with a readable
// list of field errors.
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const message = result.error.issues
      .map((i) => `${i.path.join(".") || "value"}: ${i.message}`)
      .join("; ");
    return res.status(400).json({ success: false, message });
  }
  req[source] = result.data;
  next();
};

module.exports = validate;