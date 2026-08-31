const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const config = require('../config/environment');

/**
 * Generate standard JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    config.jwtSecret,
    {
      expiresIn: '24h',
    }
  );
};

/**
 * Record authentication event to LoginLog
 */
const logAuthEvent = async (userId, event, ipAddress, userAgent) => {
  try {
    await LoginLog.create({
      userId: userId || null,
      event,
      ipAddress: ipAddress || 'Unknown',
      userAgent: userAgent || 'Unknown',
    });
  } catch (error) {
    console.error('[AuthService] Failed to record login log:', error.message);
  }
};

/**
 * Authenticate User Credentials and Issue Token
 */
const login = async ({ email, password, ipAddress, userAgent }) => {
  if (!email || !password) {
    const error = new Error('Email and password are required.');
    error.statusCode = 400;
    throw error;
  }

  // Find user and explicitly include passwordHash
  const user = await User.findOne({ 
    email: email.toLowerCase().trim(), 
    isDeleted: false 
  }).select('+passwordHash');

  if (!user) {
    await logAuthEvent(null, 'LOGIN_FAILED', ipAddress, userAgent);
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Check active account status
  if (!user.isActive) {
    await logAuthEvent(user._id, 'LOGIN_FAILED', ipAddress, userAgent);
    const error = new Error('Your account has been deactivated. Please contact an Administrator.');
    error.statusCode = 403;
    throw error;
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await logAuthEvent(user._id, 'LOGIN_FAILED', ipAddress, userAgent);
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Record successful login
  await logAuthEvent(user._id, 'LOGIN_SUCCESS', ipAddress, userAgent);

  // Generate Token
  const token = generateToken(user);

  // Convert to clean user object
  const userProfile = user.toJSON();

  return {
    token,
    user: userProfile,
  };
};

/**
 * Get Authenticated User Profile
 */
const getCurrentUser = async (userId) => {
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    const error = new Error('User not found or account is deactivated.');
    error.statusCode = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('User account is deactivated.');
    error.statusCode = 403;
    throw error;
  }

  return user.toJSON();
};

/**
 * Log Out User Event
 */
const logout = async (userId, ipAddress, userAgent) => {
  if (userId) {
    await logAuthEvent(userId, 'LOGOUT', ipAddress, userAgent);
  }
  return { message: 'Logged out successfully.' };
};

module.exports = {
  login,
  getCurrentUser,
  logout,
  generateToken,
};
