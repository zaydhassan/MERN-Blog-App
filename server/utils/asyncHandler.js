// Wrap an async route handler so rejected promises are forwarded to Express's
// error-handling middleware instead of crashing the process / returning an
// unhandled rejection. Usage: router.post("/", asyncHandler(async (req, res) => {...}))
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);