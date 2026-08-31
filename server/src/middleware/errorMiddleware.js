const { errorResponse } = require('../utils/responseHelper');
const config = require('../config/environment');

/**
 * 404 Route Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Central Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';
  const errors = err.errors || null;

  // Never expose internal stack traces or database credentials to client
  return errorResponse(res, message, statusCode, errors);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
