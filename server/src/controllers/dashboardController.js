const dashboardService = require('../services/dashboardService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Controller: Get Dashboard Summary Statistics
 * @route GET /api/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.user);
    return successResponse(res, { stats }, 'Dashboard statistics retrieved successfully.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Dashboard Chart Aggregations
 * @route GET /api/dashboard/charts
 */
const getDashboardCharts = async (req, res) => {
  try {
    const charts = await dashboardService.getDashboardCharts(req.user);
    return successResponse(res, { charts }, 'Dashboard chart aggregations retrieved.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Controller: Get Recent Activity
 * @route GET /api/dashboard/recent-activity
 */
const getRecentActivity = async (req, res) => {
  try {
    const activities = await dashboardService.getRecentActivity(req.user);
    return successResponse(res, { activities }, 'Recent activity retrieved.', 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message, statusCode);
  }
};

module.exports = {
  getDashboardStats,
  getDashboardCharts,
  getRecentActivity,
};
