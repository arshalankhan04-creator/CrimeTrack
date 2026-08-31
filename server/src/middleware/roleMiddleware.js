const { errorResponse } = require('../utils/responseHelper');

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} allowedRoles Roles permitted to access the route ('ADMIN', 'OFFICER', 'VIEWER')
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required before role verification.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
        403
      );
    }

    next();
  };
};

module.exports = {
  requireRole,
};
