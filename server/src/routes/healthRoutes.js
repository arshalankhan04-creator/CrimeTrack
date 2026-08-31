const express = require('express');
const { getDatabaseStatus } = require('../config/database');
const { successResponse } = require('../utils/responseHelper');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    System and database health check
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStatus = getDatabaseStatus();

  return successResponse(res, {
    database: dbStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: `${Math.floor(process.uptime())}s`,
  }, 'CrimeTrack API is running.');
});

module.exports = router;
