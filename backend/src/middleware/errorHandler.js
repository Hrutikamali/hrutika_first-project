/* ==========================================================================
   StyleHub - Centralized Error Handling Middleware
   Prevents stack trace leaks and formats safe user-facing JSON responses
   ========================================================================== */

function errorHandler(err, req, res, next) {
  // Safe server-side log
  console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;

  // Never expose raw database internals or sensitive stack traces in response
  res.status(statusCode).json({
    error: err.message && statusCode < 500 ? err.message : 'An unexpected server error occurred. Please try again later.',
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
