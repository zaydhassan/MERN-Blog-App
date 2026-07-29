// Shared pagination + search-query parsing for list endpoints.
//
// Usage:
//   const { page, limit, skip, q, searchRegex } = parsePagination(req);
//   const filter = { status: "Published" };
//   if (searchRegex) filter.$or = [{ title: searchRegex }, { description: searchRegex }];
//   const [items, total] = await Promise.all([
//     Model.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
//     Model.countDocuments(filter),
//   ]);
//   res.json({ success: true, items, ...paginateMeta(page, limit, total) });

const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 50;

const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  const q = (req.query.q || "").trim();
  // Case-insensitive substring match; undefined when no query so callers can
  // skip building the $or clause entirely.
  const searchRegex = q ? new RegExp(escapeRegExp(q), "i") : undefined;
  return { page, limit, skip, q, searchRegex };
};

const paginateMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 0,
  hasMore: page * limit < total,
});

module.exports = { parsePagination, paginateMeta, escapeRegExp };