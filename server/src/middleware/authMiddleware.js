const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/environment');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Authentication Middleware: Verifies JWT Bearer Token and Attaches Active User
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Session expired. Please log in again.', 401);
      }
      return errorResponse(res, 'Invalid authentication token.', 401);
    }

    // Fetch user from DB to ensure account is still active and valid
    const user = await User.findOne({ _id: decoded.id, isDeleted: false });

    if (!user) {
      return errorResponse(res, 'User associated with token no longer exists.', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated. Access denied.', 403);
    }

    // Attach user to request object
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      supervisorOfficerId: user.supervisorOfficerId ? user.supervisorOfficerId.toString() : null,
    };

    next();
  } catch (error) {
    console.error('[AuthMiddleware] Error:', error.message);
    return errorResponse(res, 'Internal authentication error.', 500);
  }
};

module.exports = {
  authenticate,
};
